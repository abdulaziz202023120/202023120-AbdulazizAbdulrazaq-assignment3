# Abdulaziz Abdulrazaq – Personal Portfolio (Assignment 3: Advanced Functionality)

My personal portfolio for **SWE 363 – Web Engineering & Development (KFUPM, Term 261)**, built with
plain **HTML, CSS and JavaScript**. Assignment 3 builds on my Assignment 2 portfolio and adds
features that react to the visitor: a remembered name, an audience view, project filters that
combine with sorting, a language chart and activity feed from the GitHub API, and a stricter
contact form.

**Live site:** https://abdulaziz202023120.github.io/202023120-AbdulazizAbdulrazaq-assignment3/

---

## What is new in Assignment 3

| Feature | What it does |
|---------|--------------|
| **Remembered visitor name** | Type your name once; the greeting becomes "Good evening, Sara!" on every visit. "Not you? Forget my name" removes it. Stored in `localStorage`, checked with a letters-only rule. |
| **Quick facts** | Days left in 2026, the number of my public repositories (from the API) and a time-on-page timer that pauses while the tab is hidden. |
| **Audience view** | Choose Recruiter, Professor or Client and get a short note and three links to the parts of the page that matter most for that reader. The choice is remembered. |
| **Project filter + sort** | Filter by category (Engineering, Software, Product) and sort by featured order, name or category. Both work together; the status line says how many projects are shown, and open or closed detail panels keep their state. |
| **GitHub extras** | A **language mix** bar chart and a **recent activity** feed (pushes, new repositories, stars, pull requests), both built from the public GitHub API with caching and clear error messages. |
| **Stricter contact form** | New *Topic* field. The **Send button stays disabled until every field is valid**, errors appear when you leave a field, the draft (including the topic) is saved and restored. |
| **Quality work** | Lighthouse 100 / 100 / 100 / 100 (performance, accessibility, best practices, SEO) on mobile and desktop; 48 automated browser checks; works with storage blocked and with GitHub offline. |

Kept from earlier assignments: time-of-day greeting, dark / light theme, sticky navigation with
active-section highlight, hamburger menu on phones, live GitHub repository list with search /
language filter / sort, expandable project details, animations that respect *reduce motion*.

## Tech stack

- HTML5 (semantic sections, ARIA for the interactive parts)
- CSS3 (custom properties, Grid, Flexbox, transitions); no framework
- Vanilla JavaScript (ES2020: `fetch`, `async/await`, `IntersectionObserver`, `localStorage`, Unicode regex); no libraries
- GitHub REST API (`/users/{user}/repos`, `/search/repositories`, `/users/{user}/events/public`, no token needed)
- Playwright (Python) for the automated checks, Lighthouse for performance and accessibility
- Hosted with GitHub Pages

## Project structure

```
├── README.md
├── index.html              # page structure and content
├── css/styles.css          # styling, themes, animations and breakpoints
├── js/script.js            # all interactivity (one function per feature)
├── assets/images/          # SVG avatar and project placeholder images
├── tests/check_site.py     # 48 automated checks with a mocked GitHub API
├── docs/
│   ├── ai-usage-report.md  # AI usage log and declaration
│   └── technical-documentation.md
└── .gitignore
```

## Setup: run it locally

No build step and no dependencies for the site itself.

1. Clone the repository:
   ```bash
   git clone https://github.com/abdulaziz202023120/202023120-AbdulazizAbdulrazaq-assignment3.git
   cd 202023120-AbdulazizAbdulrazaq-assignment3
   ```
2. Start a small local server (the page calls the GitHub API with `fetch`):
   ```bash
   python -m http.server 8000
   ```
   Then open http://localhost:8000. In VS Code you can use **Live Server** instead.
3. An internet connection is needed for the GitHub parts. Everything else works offline.

### Run the automated checks (optional)

```bash
pip install playwright
playwright install chromium
python tests/check_site.py
```

The script starts its own local server and replaces the GitHub API with fixed test data, so it
needs no network and prints one PASS / FAIL line per check (expected: `48/48 checks passed`).

## How to use the site

- **Name:** type your name in the *Your name* box under the introduction and press Save.
- **Audience view:** pick Recruiter, Professor or Client in *Where should you start?*
- **Projects:** choose a category chip, change *Sort by*, and press **Show details** on a card.
- **Code on GitHub:** search, filter by language or sort the repositories; read the language mix and
  recent activity below the list. If GitHub cannot be reached, a message explains why and offers **Try again**.
- **Contact:** fill in name, email, topic and message. **Send message** turns on when all four are valid.
  There is no backend yet, so nothing is sent.

## Performance and testing

Lighthouse 12.8 on a local server, simulated mobile and desktop:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|-----|-------------|---------------|----------------|-----|-----|-----|
| Mobile | 100 | 100 | 100 | 100 | 1.3 s | 0 |
| Desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |

The 48 automated checks and the manual review are listed in
[`docs/technical-documentation.md`](docs/technical-documentation.md#7-testing-performed).

## Browser and device compatibility

| Environment | How it was checked | Result |
|-------------|--------------------|--------|
| Chromium (the engine of Chrome and Edge), desktop | Automated checks and Lighthouse; also opened in Edge | Pass |
| Screen widths 320, 375, 768, 1024 and 1920 px | Automated check for sideways scrolling | Pass |
| Phone (iPhone 13 emulation, touch input) | Menu opens and closes by tap | Pass |
| Dark and light theme, reduced motion, storage blocked, JavaScript off | Automated checks and `<noscript>` note | Pass |
| Firefox and Safari | Not run by me; every feature I use is supported there according to MDN (see the technical documentation) | Expected to work |

## AI use (summary)

I used **Claude (Anthropic)** in the Claude desktop app. It read the assignment brief and rubric
with me, planned the features on top of my Assignment 2 code, wrote the code, tests and documentation
drafts, and ran the automated checks and Lighthouse. I set the direction, kept the content to my real
work, and reviewed every file before it was uploaded. AI-assisted commits carry an `Assisted-by`
trailer, except a few commits (listed in the usage report) where the GitHub web editor dropped it; that help is declared
in the usage log. The full log and my declaration are in [`docs/ai-usage-report.md`](docs/ai-usage-report.md);
the conversation messages and an earlier snapshot of the files are in the evidence ZIP submitted on Blackboard.

## Author

**Abdulaziz Abdulrazaq** · Student ID 202023120 · KFUPM
GitHub: [@abdulaziz202023120](https://github.com/abdulaziz202023120)
