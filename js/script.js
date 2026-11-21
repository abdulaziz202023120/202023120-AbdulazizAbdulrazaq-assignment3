/* ==========================================================================
   Portfolio interactivity
   From Assignment 1:
     1. Greeting by time of day
     2. Dark / light theme toggle (remembered in localStorage)
     3. Mobile navigation menu
     4. Highlight the nav link of the section in view
   From Assignment 2:
     5. Fade-in of sections as they scroll into view
     6. Expand / collapse project details
     7. GitHub repositories: fetch from the API, then search, filter and sort
     8. Contact form: validation, saved draft, character counter
   New in Assignment 3 (advanced functionality):
     9.  Remembered visitor name
     10. Live stats: days left in 2026, public repo count, time on page
     11. Audience view (recruiter / professor / client)
     12. Project filter by category combined with sort
     13. GitHub extras: language mix and recent activity feed
     14. Stricter contact form: topic field, Send disabled until valid
   ========================================================================== */

const GITHUB_USER = "abdulaziz202023120";
const COURSE_QUERY = "202023120 in:name org:Web-Engineering-KFUPM";
const REPO_CACHE_KEY = "repoCache";
const ACTIVITY_CACHE_KEY = "activityCache";
const CACHE_MINUTES = 30; // the GitHub API allows 60 requests per hour without a token
const DRAFT_KEY = "contactDraft";
const NAME_KEY = "visitorName";
const AUDIENCE_KEY = "audience";
const COUNTDOWN_TARGET = "2026-12-31T23:59:59"; // end of the year, local time

document.addEventListener("DOMContentLoaded", () => {
  initVisitor(); // also sets the greeting
  initThemeToggle();
  initMobileNav();
  initActiveLinks();
  initReveal();
  initStats();
  initAudience();
  initProjectFilters();
  initProjectDetails();
  initRepos();
  initActivity();
  initContactForm();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- Small storage helpers (storage can be blocked in private mode) ---------- */
function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage full or blocked: the feature still works for this visit */
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    /* nothing to clean up */
  }
}

// A cached value is "fresh" for CACHE_MINUTES
function isFresh(entry) {
  return Boolean(entry) && Date.now() - entry.savedAt < CACHE_MINUTES * 60 * 1000;
}

/* ---------- 1 + 9. Greeting by time of day, with a remembered name ---------- */
function greetingText(name) {
  const hour = new Date().getHours();
  let text = "Good evening";
  if (hour >= 5 && hour < 12) text = "Good morning";
  else if (hour >= 12 && hour < 17) text = "Good afternoon";
  return name ? `${text}, ${name}!` : `${text}!`;
}

function initVisitor() {
  const greeting = document.getElementById("greeting");
  const form = document.getElementById("visitorForm");
  const input = document.getElementById("visitorName");
  const error = document.getElementById("visitorError");
  const welcome = document.getElementById("visitorWelcome");
  const clear = document.getElementById("visitorClear");

  const show = (name) => {
    greeting.textContent = greetingText(name);
    form.hidden = Boolean(name);
    welcome.hidden = !name;
  };

  const saved = readStorage(NAME_KEY);
  show(typeof saved === "string" ? saved : "");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = input.value.trim();
    // letters (any language), spaces, dots, hyphens and apostrophes only, 2 to 30 characters
    if (!/^[\p{L}][\p{L} .'-]{1,29}$/u.test(name)) {
      error.textContent = "Please use 2 to 30 letters (spaces, dots, hyphens and apostrophes are fine).";
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    error.textContent = "";
    input.classList.remove("invalid");
    input.setAttribute("aria-invalid", "false");
    writeStorage(NAME_KEY, name);
    show(name);
  });

  clear.addEventListener("click", () => {
    removeStorage(NAME_KEY);
    input.value = "";
    show("");
    input.focus();
  });
}

/* ---------- 2. Theme toggle ---------- */
function initThemeToggle() {
  const button = document.getElementById("themeToggle");
  const root = document.documentElement;

  const currentTheme = () =>
    root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const updateLabel = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${next} theme`);
  };

  root.setAttribute("data-theme", currentTheme());
  updateLabel();

  button.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next); // stored as a plain string, read by the inline script in <head>
    } catch (e) {
      /* storage blocked: the theme still changes for this visit */
    }
    updateLabel();
  });
}

/* ---------- 3. Mobile navigation ---------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const setOpen = (isOpen) => {
    links.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));

  // Escape closes the menu and returns focus to the button
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && links.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- 4. Active link while scrolling ---------- */
function initActiveLinks() {
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
}

/* ---------- 5. Fade-in on scroll ---------- */
function initReveal() {
  const sections = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Without IntersectionObserver, or when the user asked for less motion, just show everything
  if (!("IntersectionObserver" in window) || reduceMotion) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  document.documentElement.classList.add("js-reveal"); // hide sections only once JS is running
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target); // animate once
      });
    },
    { threshold: 0.12 }
  );
  sections.forEach((section) => observer.observe(section));
}

/* ---------- 10. Live stats: countdown and time on page ---------- */
function daysUntil(target, now = new Date()) {
  return Math.max(0, Math.ceil((new Date(target) - now) / 86400000));
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function initStats() {
  const days = document.getElementById("countdownDays");
  const label = document.getElementById("countdownLabel");
  const timer = document.getElementById("siteTimer");
  const started = Date.now();

  const remaining = daysUntil(COUNTDOWN_TARGET);
  days.textContent = String(remaining);
  label.textContent = remaining === 1 ? "day left in 2026" : "days left in 2026";

  // Update once per second, but stop while the tab is hidden to save work
  let handle = null;
  const tick = () => {
    timer.textContent = formatDuration(Math.floor((Date.now() - started) / 1000));
  };
  const start = () => {
    if (handle === null) handle = setInterval(tick, 1000);
  };
  const stop = () => {
    clearInterval(handle);
    handle = null;
  };
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : (tick(), start())));
  tick();
  start();
}

/* ---------- 11. Audience view ---------- */
const AUDIENCES = {
  recruiter: {
    text: "Short on time? These three parts show what I can do and how I work.",
    links: [
      ["#projects", "Projects: what I built and my role"],
      ["#github", "GitHub: live code and recent activity"],
      ["#contact", "Contact: send me a message"],
    ],
  },
  professor: {
    text: "This page is built to be checked against the course requirements.",
    links: [
      ["#github", "GitHub: repositories fetched live from the API"],
      ["#projects", "Projects: filter and sort work together"],
      ["#contact", "Contact: validation and a saved draft"],
    ],
  },
  client: {
    text: "Looking for help with a process or a product? Start here.",
    links: [
      ["#skills", "Skills: operations, data and product"],
      ["#projects", "Projects: examples of finished and running work"],
      ["#contact", "Contact: tell me what you need"],
    ],
  },
};

function initAudience() {
  const chips = [...document.querySelectorAll("[data-audience]")];
  const text = document.getElementById("audienceText");
  const linksList = document.getElementById("audienceLinks");

  const choose = (key, save) => {
    const view = AUDIENCES[key];
    chips.forEach((chip) => {
      const on = chip.dataset.audience === key && Boolean(view);
      chip.classList.toggle("active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    if (!view) return;
    text.textContent = view.text;
    linksList.replaceChildren(
      ...view.links.map(([href, label]) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        item.append(link);
        return item;
      })
    );
    if (save) writeStorage(AUDIENCE_KEY, key);
  };

  chips.forEach((chip) => chip.addEventListener("click", () => choose(chip.dataset.audience, true)));
  choose(readStorage(AUDIENCE_KEY), false);
}

/* ---------- 12. Project filter by category + sort ---------- */
function initProjectFilters() {
  const grid = document.getElementById("projectGrid");
  const cards = [...grid.querySelectorAll(".project-card")];
  const chips = [...document.querySelectorAll("[data-category]")];
  const sort = document.getElementById("projectSort");
  const status = document.getElementById("projectStatus");
  const empty = document.getElementById("projectEmpty");
  let category = "all";

  const render = () => {
    const ordered = [...cards].sort((a, b) => {
      if (sort.value === "name") return a.dataset.name.localeCompare(b.dataset.name);
      if (sort.value === "category") {
        return a.dataset.category.localeCompare(b.dataset.category) || a.dataset.name.localeCompare(b.dataset.name);
      }
      return Number(a.dataset.order) - Number(b.dataset.order);
    });
    // Re-appending in order moves the existing nodes, so their open or closed state is kept
    ordered.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
      grid.append(card);
    });
    const shown = ordered.filter((card) => !card.hidden).length;
    empty.hidden = shown !== 0;
    status.textContent = `Showing ${shown} of ${cards.length} projects.`;
  };

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      category = chip.dataset.category;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render();
    })
  );
  sort.addEventListener("change", render);
  render();
}

/* ---------- 6. Project details (expand / collapse) ---------- */
function initProjectDetails() {
  document.querySelectorAll(".details-toggle").forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));

    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      button.firstChild.textContent = isOpen ? "Show details " : "Hide details ";

      if (isOpen) {
        panel.classList.remove("open");
        // wait for the closing animation before hiding it from screen readers
        panel.addEventListener("transitionend", () => (panel.hidden = true), { once: true });
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) panel.hidden = true;
      } else {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("open"));
      }
    });
  });
}

/* ---------- 7 + 13. GitHub repositories, language mix ---------- */
function initRepos() {
  const list = document.getElementById("repoList");
  const status = document.getElementById("repoStatus");
  const search = document.getElementById("repoSearch");
  const language = document.getElementById("repoLanguage");
  const sort = document.getElementById("repoSort");
  const count = document.getElementById("repoCount");
  let repos = [];

  const setStatus = (text, type = "") => {
    status.textContent = text;
    status.className = `repo-status ${type}`.trim();
  };

  // Rebuild the list from the current search, language and sort choices
  const render = () => {
    const term = search.value.trim().toLowerCase();
    const lang = language.value;

    const shown = repos
      .filter((repo) => lang === "all" || repo.language === lang)
      .filter((repo) => `${repo.name} ${repo.description}`.toLowerCase().includes(term))
      .sort((a, b) => {
        if (sort.value === "name") return a.name.localeCompare(b.name);
        if (sort.value === "stars") return b.stars - a.stars;
        return new Date(b.updated) - new Date(a.updated);
      });

    list.replaceChildren(...shown.map(createRepoCard));

    if (repos.length === 0) {
      setStatus("There are no public repositories on this account yet. Check back soon.", "empty");
    } else if (shown.length === 0) {
      setStatus(`No repositories match your search. Try another word or choose "All languages".`, "empty");
    } else {
      setStatus(`Showing ${shown.length} of ${repos.length} repositories.`);
    }
  };

  const fillLanguages = () => {
    const languages = [...new Set(repos.map((repo) => repo.language).filter(Boolean))].sort();
    language.replaceChildren(new Option("All languages", "all"), ...languages.map((l) => new Option(l, l)));
  };

  const show = () => {
    count.textContent = String(repos.length);
    fillLanguages();
    renderLanguageBars(repos);
    render();
  };

  const load = async () => {
    // Use a recent copy if we have one, to save API calls
    const cached = readStorage(REPO_CACHE_KEY);
    if (isFresh(cached)) {
      repos = cached.repos;
      show();
      return;
    }

    setStatus("Loading repositories…", "loading");
    list.replaceChildren(...Array.from({ length: 3 }, createSkeletonCard));

    try {
      // My own repositories, plus my course repositories in the class organisation
      // (their names start with my student ID)
      const [own, course] = await Promise.all([
        fetchJson(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
        fetchJson(`https://api.github.com/search/repositories?per_page=100&q=${encodeURIComponent(COURSE_QUERY)}`),
      ]);

      // Merge both lists without duplicates
      const byName = new Map([...own, ...course.items].map((repo) => [repo.full_name, repo]));
      // Keep only the fields the page uses, and skip forks
      repos = [...byName.values()]
        .filter((repo) => !repo.fork)
        .map((repo) => ({
          name: repo.name,
          description: repo.description || "",
          language: repo.language,
          stars: repo.stargazers_count,
          updated: repo.updated_at,
          url: repo.html_url,
        }));

      writeStorage(REPO_CACHE_KEY, { savedAt: Date.now(), repos });
      show();
    } catch (error) {
      list.replaceChildren();
      if (cached) {
        // An old copy is better than nothing
        repos = cached.repos;
        show();
        setStatus("GitHub could not be reached, so this is the last saved list.", "error");
        return;
      }
      count.textContent = "n/a";
      renderLanguageBars([]);
      const reason =
        error.message === "rate-limit"
          ? "GitHub is limiting requests right now. Please wait a few minutes"
          : "The repositories could not be loaded. Check your connection";
      showRepoError(`${reason}, then try again.`, load);
    }
  };

  const showRepoError = (message, retry) => {
    setStatus(message, "error");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost btn-small";
    button.textContent = "Try again";
    button.addEventListener("click", retry, { once: true });
    status.append(" ", button);
  };

  search.addEventListener("input", render);
  language.addEventListener("change", render);
  sort.addEventListener("change", render);
  load();
}

// Count repositories per language and draw one bar per language (width = share of repositories)
function languageShares(repos) {
  const counts = new Map();
  repos.forEach((repo) => {
    const key = repo.language || "Other";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const total = repos.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => ({ name, n, percent: Math.round((n / total) * 100) }));
}

function renderLanguageBars(repos) {
  const list = document.getElementById("langBars");
  if (repos.length === 0) {
    const item = document.createElement("li");
    item.className = "lang-empty";
    item.textContent = "No data yet.";
    list.replaceChildren(item);
    return;
  }
  list.replaceChildren(
    ...languageShares(repos).map(({ name, n, percent }) => {
      const item = document.createElement("li");
      item.className = "lang-row";
      const label = document.createElement("span");
      label.className = "lang-name";
      label.textContent = `${name} (${n})`;
      const track = document.createElement("span");
      track.className = "lang-track";
      track.setAttribute("aria-hidden", "true");
      const fill = document.createElement("span");
      fill.className = "lang-fill";
      fill.style.width = `${percent}%`;
      track.append(fill);
      const value = document.createElement("span");
      value.className = "lang-percent";
      value.textContent = `${percent}%`;
      item.append(label, track, value);
      return item;
    })
  );
}

// GET a GitHub API URL and return the parsed JSON, or throw a clear error
async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (response.status === 403 || response.status === 429) throw new Error("rate-limit");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Build one repository card with textContent only (API text is never inserted as HTML)
function createRepoCard(repo) {
  const item = document.createElement("li");
  item.className = "repo-card";

  const title = document.createElement("h3");
  const link = document.createElement("a");
  link.href = repo.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = repo.name;
  title.append(link);

  const description = document.createElement("p");
  description.textContent = repo.description || "No description yet.";

  const meta = document.createElement("p");
  meta.className = "repo-meta";
  const updated = new Date(repo.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  meta.textContent = [repo.language || "Other", `★ ${repo.stars}`, `Updated ${updated}`].join(" · ");

  item.append(title, description, meta);
  return item;
}

function createSkeletonCard() {
  const item = document.createElement("li");
  item.className = "repo-card skeleton";
  item.setAttribute("aria-hidden", "true");
  return item;
}

/* ---------- 13. Recent GitHub activity ---------- */
// Turn one GitHub event into a short sentence, or null for event types we do not show
function describeEvent(event) {
  const repo = event.repo && event.repo.name ? event.repo.name.split("/").pop() : "a repository";
  switch (event.type) {
    case "PushEvent": {
      const n = (event.payload && event.payload.size) || (event.payload && event.payload.commits ? event.payload.commits.length : 0);
      return n > 0 ? `Pushed ${n} ${n === 1 ? "commit" : "commits"} to ${repo}` : `Pushed to ${repo}`;
    }
    case "CreateEvent":
      return event.payload && event.payload.ref_type === "repository" ? `Created ${repo}` : `Created a ${event.payload.ref_type} in ${repo}`;
    case "PullRequestEvent":
      return `${capitalise(event.payload.action)} a pull request in ${repo}`;
    case "IssuesEvent":
      return `${capitalise(event.payload.action)} an issue in ${repo}`;
    case "WatchEvent":
      return `Starred ${repo}`;
    case "ForkEvent":
      return `Forked ${repo}`;
    case "ReleaseEvent":
      return `Published a release in ${repo}`;
    default:
      return null;
  }
}

function capitalise(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

// "3 days ago", "2 hours ago", "just now"
function timeAgo(isoDate, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - new Date(isoDate)) / 1000));
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const value = Math.floor(seconds / size);
      return `${value} ${name}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

function initActivity() {
  const list = document.getElementById("activityList");
  const status = document.getElementById("activityStatus");

  const render = (events) => {
    const items = events
      .map((event) => ({ text: describeEvent(event), at: event.created_at }))
      .filter((entry) => entry.text)
      .slice(0, 6);

    if (items.length === 0) {
      status.textContent = "No recent public activity to show.";
      list.replaceChildren();
      return;
    }
    status.textContent = "";
    list.replaceChildren(
      ...items.map((entry) => {
        const item = document.createElement("li");
        const text = document.createElement("span");
        text.textContent = entry.text;
        const when = document.createElement("time");
        when.dateTime = entry.at;
        when.textContent = timeAgo(entry.at);
        item.append(text, when);
        return item;
      })
    );
  };

  const load = async () => {
    const cached = readStorage(ACTIVITY_CACHE_KEY);
    if (isFresh(cached)) {
      render(cached.events);
      return;
    }
    status.textContent = "Loading activity…";
    try {
      const events = await fetchJson(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`);
      writeStorage(ACTIVITY_CACHE_KEY, { savedAt: Date.now(), events: events.slice(0, 30) });
      render(events);
    } catch (error) {
      if (cached) {
        render(cached.events);
        return;
      }
      list.replaceChildren();
      status.textContent =
        error.message === "rate-limit"
          ? "GitHub is limiting requests right now. Activity will appear later."
          : "Recent activity could not be loaded.";
    }
  };

  load();
}

/* ---------- 8 + 14. Contact form ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const send = document.getElementById("sendButton");
  const hint = document.getElementById("formHint");
  const message = form.elements.message;
  const counter = document.getElementById("charCount");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    name: (value) => (value.length < 2 ? "Please enter your name (at least 2 characters)." : ""),
    email: (value) => (!emailPattern.test(value) ? "Please enter a valid email address, like name@example.com." : ""),
    topic: (value) => (value === "" ? "Please choose a topic." : ""),
    message: (value) => (value.length < 10 ? "Your message should be at least 10 characters." : ""),
  };
  const fieldNames = Object.keys(rules);
  const fields = fieldNames.map((name) => form.elements[name]);

  const showStatus = (text, type) => {
    status.textContent = text;
    status.className = `form-status ${type}`;
    // restart the animation each time a new message appears
    status.classList.remove("show");
    void status.offsetWidth;
    status.classList.add("show");
  };

  // Check one field and show or clear its error message
  const validateField = (field) => {
    const error = rules[field.name](field.value.trim());
    document.getElementById(`${field.name}Error`).textContent = error;
    field.classList.toggle("invalid", error !== "");
    field.setAttribute("aria-invalid", String(error !== ""));
    return error === "";
  };

  // Silent check (no messages) used to enable or disable the Send button
  const isFormValid = () => fieldNames.every((name) => rules[name](form.elements[name].value.trim()) === "");

  const updateSendState = () => {
    const ok = isFormValid();
    send.disabled = !ok;
    hint.hidden = ok;
  };

  const updateCounter = () => {
    counter.textContent = `${message.value.length} / ${message.maxLength}`;
  };

  // Restore a saved draft
  const draft = readStorage(DRAFT_KEY);
  if (draft) {
    fieldNames.forEach((key) => (form.elements[key].value = draft[key] || ""));
    if (fieldNames.some((key) => draft[key])) showStatus("Your unsent draft was restored.", "info");
  }
  updateCounter();
  updateSendState();

  fields.forEach((field) => {
    const onChange = () => {
      if (field.classList.contains("invalid")) validateField(field);
      if (field === message) updateCounter();
      updateSendState();
      writeStorage(DRAFT_KEY, Object.fromEntries(fieldNames.map((key) => [key, form.elements[key].value])));
    };
    field.addEventListener("input", onChange);
    field.addEventListener("change", onChange);
    // show the error as soon as the user leaves a field that is still wrong
    field.addEventListener("blur", () => {
      if (field.value !== "") validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // no backend yet
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      showStatus("Please fix the highlighted fields and send again.", "error");
      fields.find((field) => field.classList.contains("invalid")).focus();
      return;
    }

    const name = form.elements.name.value.trim();
    showStatus(`Thanks, ${name}! Your message is ready. (This demo has no backend, so nothing was sent.)`, "success");
    form.reset();
    removeStorage(DRAFT_KEY);
    updateCounter();
    updateSendState();
  });
}
