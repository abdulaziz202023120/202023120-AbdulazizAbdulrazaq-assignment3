"""
Automated checks for the portfolio (Assignment 3).

Run:  python tests/check_site.py
Needs: pip install playwright && playwright install chromium

The GitHub API is replaced with fixed sample data, so the tests do not use the
network and give the same result every time.
"""
import functools
import http.server
import json
import pathlib
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent

OWN = [
    {"full_name": "me/alpha", "name": "alpha", "description": "First tool", "language": "JavaScript",
     "stargazers_count": 3, "updated_at": "2026-11-10T10:00:00Z", "html_url": "https://github.com/me/alpha", "fork": False},
    {"full_name": "me/beta", "name": "beta", "description": "<img src=x onerror=window.__xss=1>", "language": "Python",
     "stargazers_count": 1, "updated_at": "2026-11-12T10:00:00Z", "html_url": "https://github.com/me/beta", "fork": False},
    {"full_name": "me/gamma", "name": "gamma", "description": None, "language": "JavaScript",
     "stargazers_count": 0, "updated_at": "2026-11-01T10:00:00Z", "html_url": "https://github.com/me/gamma", "fork": False},
    {"full_name": "me/forked", "name": "forked", "description": "skip me", "language": "C",
     "stargazers_count": 9, "updated_at": "2026-11-13T10:00:00Z", "html_url": "https://github.com/me/forked", "fork": True},
]
EVENTS = [
    {"type": "PushEvent", "repo": {"name": "me/alpha"}, "payload": {"size": 2}, "created_at": "2026-11-19T10:00:00Z"},
    {"type": "WatchEvent", "repo": {"name": "x/other"}, "payload": {}, "created_at": "2026-11-18T10:00:00Z"},
    {"type": "SomethingElseEvent", "repo": {"name": "x/y"}, "payload": {}, "created_at": "2026-11-17T10:00:00Z"},
]

results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name + (f"  [{detail}]" if detail and not condition else ""))


def mock_api(page, mode="ok"):
    def handler(route):
        url = route.request.url
        if mode == "rate":
            route.fulfill(status=403, body="{}", content_type="application/json")
        elif "/search/repositories" in url:
            route.fulfill(json={"items": []})
        elif "/events/public" in url:
            route.fulfill(json=EVENTS)
        elif "/repos" in url:
            route.fulfill(json=OWN)
        else:
            route.fulfill(status=404, body="{}")
    page.route("https://api.github.com/**", handler)


def new_page(browser, mode="ok", width=1280, height=900, init_script=None):
    context = browser.new_context(viewport={"width": width, "height": height})
    if init_script:
        context.add_init_script(init_script)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    mock_api(page, mode)
    return page, errors


def main():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args, **kwargs):  # keep the test output short
            pass

    handler = functools.partial(Quiet, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ---- 1. Load, repositories, language mix, activity, stats ----
        page, errors = new_page(browser)
        page.goto(base)
        page.wait_for_selector("#repoList .repo-card:not(.skeleton)")
        check("no console errors on load", not errors, errors)
        check("forks are skipped (3 repos shown)", page.locator("#repoList .repo-card").count() == 3)
        check("repo count stat = 3", page.inner_text("#repoCount") == "3")
        check("API text is not run as HTML (no XSS)", page.evaluate("window.__xss") is None)
        check("language bars: JavaScript 67%", "67%" in page.inner_text("#langBars"))
        check("activity shows 2 known events, skips unknown", page.locator("#activityList li").count() == 2)
        check("activity text for push event", "Pushed 2 commits to alpha" in page.inner_text("#activityList"))
        check("countdown is a number", page.inner_text("#countdownDays").isdigit())
        page.wait_for_timeout(2200)
        check("timer ticks", page.inner_text("#siteTimer") != "00:00")

        # search + language + sort
        page.fill("#repoSearch", "beta")
        check("repo search narrows list", page.locator("#repoList .repo-card").count() == 1)
        page.fill("#repoSearch", "zzz")
        check("repo search empty message", "No repositories match" in page.inner_text("#repoStatus"))
        page.fill("#repoSearch", "")
        page.select_option("#repoLanguage", "JavaScript")
        check("language filter", page.locator("#repoList .repo-card").count() == 2)
        page.select_option("#repoLanguage", "all")
        page.select_option("#repoSort", "name")
        first = page.locator("#repoList .repo-card h3").first.inner_text()
        check("repo sort by name", first == "alpha", first)

        # ---- 2. Project filter + sort ----
        page.click("[data-category='engineering']")
        visible = page.locator("#projectGrid .project-card:not([hidden])").count()
        check("category filter: engineering shows 2", visible == 2, visible)
        page.select_option("#projectSort", "name")
        names = page.locator("#projectGrid .project-card:not([hidden]) h3").all_inner_texts()
        check("filter and sort combine", names == sorted(names) and len(names) == 2, names)
        page.click("[data-category='software']")
        check("category filter: software shows 1", page.locator("#projectGrid .project-card:not([hidden])").count() == 1)
        check("project status text", "Showing 1 of 4" in page.inner_text("#projectStatus"))
        page.click("[data-category='all']")
        page.click(".details-toggle >> nth=0")
        check("details toggle opens", page.get_attribute(".details-toggle >> nth=0", "aria-expanded") == "true")

        # ---- 3. Audience view persists ----
        page.click("[data-audience='professor']")
        check("audience shows links", page.locator("#audienceLinks li").count() == 3)
        check("audience chip pressed", page.get_attribute("[data-audience='professor']", "aria-pressed") == "true")
        page.reload()
        page.wait_for_selector("#audienceLinks li")
        check("audience choice remembered after reload", page.get_attribute("[data-audience='professor']", "aria-pressed") == "true")

        # ---- 4. Visitor name ----
        page.fill("#visitorName", "1")
        page.click("#visitorForm button[type=submit]")
        check("bad name rejected", "2 to 30 letters" in page.inner_text("#visitorError"))
        page.fill("#visitorName", "Sara")
        page.click("#visitorForm button[type=submit]")
        check("greeting uses saved name", "Sara" in page.inner_text("#greeting"))
        page.reload()
        check("name remembered after reload", "Sara" in page.inner_text("#greeting"))
        page.click("#visitorClear")
        check("forget name works", "Sara" not in page.inner_text("#greeting"))

        # ---- 5. Contact form ----
        check("send disabled at start", page.is_disabled("#sendButton"))
        page.fill("#name", "Ali")
        page.fill("#email", "not-an-email")
        page.select_option("#topic", "question")
        page.fill("#message", "Hello there, nice site!")
        check("send still disabled with bad email", page.is_disabled("#sendButton"))
        page.fill("#email", "ali@example.com")
        check("send enabled when all valid", not page.is_disabled("#sendButton"))
        page.fill("#message", "short")
        check("send disabled again when message too short", page.is_disabled("#sendButton"))
        page.fill("#message", "Hello there, nice site!")
        page.reload()
        check("draft restored after reload", page.input_value("#name") == "Ali" and page.input_value("#topic") == "question")
        check("send enabled after draft restore", not page.is_disabled("#sendButton"))
        page.click("#sendButton")
        check("success message shown", "Thanks, Ali" in page.inner_text("#formStatus"))
        check("form cleared and disabled after send", page.input_value("#name") == "" and page.is_disabled("#sendButton"))
        page.fill("#name", "A")
        page.locator("#name").blur()
        check("blur shows error", "at least 2" in page.inner_text("#nameError"))

        # ---- 6. Theme toggle ----
        page.click("#themeToggle")
        theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
        page.reload()
        check("theme remembered", page.evaluate("document.documentElement.getAttribute('data-theme')") == theme)
        page.context.close()

        # ---- 7. Different screen sizes: no sideways scroll ----
        for width, height in [(320, 700), (375, 800), (768, 1024), (1024, 768), (1920, 1080)]:
            page, errors = new_page(browser, width=width, height=height)
            page.goto(base)
            page.wait_for_selector("#repoList .repo-card:not(.skeleton)")
            overflow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            check(f"no horizontal scroll at {width}px", overflow <= 0, overflow)
            page.context.close()

        # ---- 7b. Phone emulation (touch, mobile user agent): menu opens and a link works ----
        phone = browser.new_context(**p.devices["iPhone 13"])
        page = phone.new_page()
        mock_api(page)
        page.goto(base)
        page.wait_for_selector("#repoList .repo-card:not(.skeleton)")
        page.tap("#navToggle")
        check("phone: menu opens", page.get_attribute("#navToggle", "aria-expanded") == "true")
        page.tap("#navLinks a[href='#projects']")
        check("phone: menu closes after choosing a link", page.get_attribute("#navToggle", "aria-expanded") == "false")
        phone.close()

        # ---- 8. Rate limit: clear message + retry ----
        page, errors = new_page(browser, mode="rate")
        page.goto(base)
        page.wait_for_selector("#repoStatus .btn")
        check("rate-limit message", "limiting requests" in page.inner_text("#repoStatus"))
        check("rate-limit: activity message", "limiting" in page.inner_text("#activityStatus"))
        check("rate-limit: repo count n/a", page.inner_text("#repoCount") == "n/a")
        page.unroute("https://api.github.com/**")
        mock_api(page, "ok")
        page.click("#repoStatus .btn")
        page.wait_for_selector("#repoList .repo-card:not(.skeleton)")
        check("Try again recovers", page.locator("#repoList .repo-card").count() == 3)
        page.context.close()

        # ---- 9. Storage blocked: page still works ----
        blocked = "Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});"
        page, errors = new_page(browser, init_script=blocked)
        page.goto(base)
        page.wait_for_selector("#repoList .repo-card:not(.skeleton)")
        page.click("[data-audience='client']")
        check("works with storage blocked", page.locator("#audienceLinks li").count() == 3)
        check("no uncaught errors with storage blocked", not [e for e in errors if "blocked" in e and "Uncaught" in e], errors)
        page.context.close()

        browser.close()
    server.shutdown()

    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
