# Technical Documentation (Assignment 3)

## 1. Overview

The portfolio is a static, single-page web application: one HTML file, one stylesheet and one
script, with no build tool and no library. Assignment 3 adds features that depend on the visitor
(remembered name, audience view, filters) and more uses of the public GitHub REST API.

```
Browser ──loads──> index.html ──> css/styles.css
                        │
                        └──> js/script.js ──fetch──> api.github.com
                                   │                   /users/abdulaziz202023120/repos
                                   │                   /search/repositories   (course repos)
                                   │                   /users/abdulaziz202023120/events/public
                                   │
                                   └──> localStorage: theme, repoCache, activityCache,
                                                      contactDraft, visitorName, audience
```

## 2. Page structure (`index.html`)

| Element | Purpose |
|---------|---------|
| `<header class="site-header">` | Sticky navigation, hamburger button, theme toggle |
| `<section id="about">` | Greeting, name, introduction, **name form**, **quick-facts row**, avatar |
| `<section id="audience">` | **New.** Three chips (Recruiter / Professor / Client) and a panel with a note and links |
| `<section id="skills">` | Four skill cards |
| `<section id="projects">` | **Category chips + sort menu**, four project cards (each with a details panel), empty note |
| `<section id="github">` | Repository search / language / sort, repository list, **language mix** and **recent activity** panels |
| `<section id="contact">` | Contact form with name, email, **topic**, message, counter, disabled Send button and hint |
| `<footer>` | Copyright, GitHub link, back to top |

Accessibility:

- Chips are real `<button>`s with `aria-pressed`; the audience panel and all status lines use
  `aria-live="polite"`, so changes are announced.
- Every input has a visible `<label>`; error text is in an `aria-live` element and invalid fields get `aria-invalid`.
- The language bars are decorative (`aria-hidden`); the same numbers are in the text next to them.
- A skip link, visible focus outlines, `lang` on the Arabic project name, and a `<noscript>` note.
- Lighthouse accessibility score: 100.

## 3. Styling (`css/styles.css`)

Section 14 of the stylesheet holds everything new, using the same colour tokens as before (so dark
mode works without extra rules): chips, visitor form, quick-facts row, audience panel, project
controls, the two GitHub panels (two columns above 900 px, one column below), the select field in the
form and the disabled button style. A global `[hidden] { display: none !important; }` rule makes the
`hidden` attribute always win over `display: grid` or `flex`.

## 4. JavaScript (`js/script.js`)

One function per feature, called from a single `DOMContentLoaded` handler.

| Function | New in A3? | What it does |
|----------|------------|--------------|
| `initVisitor()` | yes | Validates a name, saves it in `localStorage`, builds the greeting with `greetingText(name)`, "forget my name" |
| `initStats()` | yes | Days left in 2026 (`daysUntil`), time-on-page timer (`formatDuration`), paused by `visibilitychange` |
| `initAudience()` | yes | Builds the note and links for the chosen audience from the `AUDIENCES` table; remembers the choice |
| `initProjectFilters()` | yes | Category filter combined with sort; re-appends cards in order so their open or closed state is kept |
| `initRepos()` | extended | As in A2, plus the repository count and the language bars |
| `languageShares()`, `renderLanguageBars()` | yes | Count repositories per language and draw one bar per language |
| `initActivity()`, `describeEvent()`, `timeAgo()` | yes | Load public events, turn each into one sentence, show the latest six |
| `initContactForm()` | extended | Four rules, silent validity check for the Send button, validation on blur, draft with topic |
| `initThemeToggle`, `initMobileNav`, `initActiveLinks`, `initReveal`, `initProjectDetails` | no | Unchanged from earlier assignments |

All `localStorage` access goes through `readStorage`, `writeStorage` and `removeStorage`, which
catch errors, because storage can be blocked or full. If it is, every feature still works for the current visit.

### 4.1 Remembered name

The name must match `/^[\p{L}][\p{L} .'-]{1,29}$/u`: it starts with a letter (any language), has
2 to 30 characters, and may contain letters, spaces, dots, hyphens and apostrophes. Anything else shows
"Please use 2 to 30 letters…" and keeps focus in the box. The name is only ever written with
`textContent`, so it cannot inject HTML.

### 4.2 Project filter and sort together

Each project card carries `data-category`, `data-order` and `data-name`. `render()` sorts the cards by
the chosen key (featured order, name, or category then name), sets `hidden` on cards that do not match
the category, and appends the cards back in the new order. Moving existing nodes (instead of rebuilding
them) keeps each card's expanded state. The status line reads "Showing 2 of 4 projects.", and an empty
note appears if a filter ever matches nothing.

### 4.3 GitHub data

| Data | Request | Cache | Failure behaviour |
|------|---------|-------|-------------------|
| Repositories | `/users/{user}/repos` and `/search/repositories` in parallel, merged by `full_name`, forks removed | `repoCache`, 30 min | Rate-limit or connection message with **Try again**; an old cached copy is shown if there is one |
| Activity | `/users/{user}/events/public` | `activityCache`, 30 min | Clear one-line message; cached events if available |

The GitHub API allows 60 unauthenticated requests per hour, so both responses are cached.
Language share is `round(count / total × 100)` per language; repositories without a language count as "Other".
`describeEvent()` supports push, create, pull request, issue, star, fork and release events and ignores
all other types.

### 4.4 Contact form

| Field | Rule |
|-------|------|
| Name | at least 2 characters |
| Email | matches `name@domain.tld` |
| Topic | one of the three options must be chosen |
| Message | at least 10 characters (maximum 1000) |

`isFormValid()` runs the four rules without showing any message and sets `sendButton.disabled`.
Errors are shown when a field is left (`blur`) and while correcting an invalid field. The
draft `{ name, email, topic, message }` is saved on every change and restored on the next visit.
A successful submit resets the form, deletes the draft and disables the button again.

## 5. Performance

Measured with Lighthouse 12.8 (local server, simulated mobile and desktop):

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|-----|-------------|---------------|----------------|-----|-----|-----|-----|-----|
| Mobile | 100 | 100 | 100 | 100 | 0.9 s | 1.3 s | 70 ms | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.2 s | 0.4 s | 0 ms | 0 |

What keeps it fast: no framework or web font; one HTML, one CSS and one JS file (about 66 KB in total);
`defer` on the script; `loading="lazy"` and explicit `width`/`height` on project images (so nothing
jumps: CLS 0); cached API responses; `preconnect` to `api.github.com`; a favicon, so the browser makes no
failing request for one.

## 6. Browser and device compatibility

| Feature used | Oldest version that supports it (MDN) |
|--------------|----------------------------------------|
| CSS Grid, custom properties | Chrome 57, Edge 16, Firefox 52, Safari 10.1 |
| `fetch`, `async/await` | Chrome 55, Edge 15, Firefox 52, Safari 11 |
| `IntersectionObserver` | Chrome 58, Edge 16, Firefox 55, Safari 12.1 |
| `Object.fromEntries` | Chrome 73, Edge 79, Firefox 63, Safari 12.1 |
| Unicode property escapes `\p{L}` | Chrome 64, Edge 79, Firefox 78, Safari 11.1 |
| `replaceChildren()` | Chrome 86, Edge 86, Firefox 78, Safari 14 |

All of them are available in the current versions of Chrome, Edge, Firefox and Safari, on desktop and phones.

What I tested myself: Chromium (the engine behind Chrome and Edge), at 320, 375, 768, 1024 and 1920 px,
with an iPhone 13 emulation (touch and mobile user agent). I could not run Firefox or Safari in my test
environment, so for those two the support table above is the evidence, not a test run.

Fallbacks: no `IntersectionObserver` means sections show immediately; blocked storage means nothing is
remembered but nothing breaks; no JavaScript shows a `<noscript>` note and the static content;
`prefers-reduced-motion` turns animations off.

## 7. Testing performed

`tests/check_site.py` runs 48 checks in Chromium with Playwright. The GitHub API is replaced with fixed
data (3 normal repositories, 1 fork, one description that contains an `<img onerror>` tag, 3 events of which
one is an unsupported type), so the results are repeatable and failures can be tested on purpose.

| Area | Checks |
|------|--------|
| Load | No console errors; the fork is skipped; repo count stat is 3; the `<img onerror>` text is not run as HTML |
| GitHub extras | JavaScript 67 % in the language mix; 2 of 3 events shown; "Pushed 2 commits to alpha"; countdown is a number; timer ticks |
| Repositories | Search narrows and shows an empty message; language filter; sort by name |
| Projects | Engineering shows 2, Software shows 1, All restores; filter and sort combine; status text; details toggle |
| Audience | Three links appear; chip is pressed; choice survives a reload |
| Name | Bad name rejected; greeting uses the name; survives a reload; "forget" works |
| Contact form | Send disabled at the start, with a bad email, with a short message; enabled when valid; draft and topic restored after reload; success message; form cleared and button disabled again; error on blur |
| Theme | Choice survives a reload |
| Layout | No horizontal scroll at 320, 375, 768, 1024 and 1920 px; iPhone 13 emulation: the menu opens and closes by tap |
| Failure | Rate limit (403) shows the message, activity message and "n/a"; **Try again** recovers |
| Blocked storage | `localStorage` throwing on every access: page still works, no uncaught error |

Result: **48 / 48 passed.** Manual review: desktop light, desktop dark and mobile screenshots of the full page.

## 8. Known limits and next steps

- The contact form has no backend, so a message is not sent (planned later in the course).
- The activity feed only shows what GitHub's public events API returns (recent events, up to 90 days).
- Project images are placeholders; real screenshots would replace them.
