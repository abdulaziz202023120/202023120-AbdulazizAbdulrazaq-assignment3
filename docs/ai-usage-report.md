# AI Usage Report – Assignment 3 (Advanced Functionality)

**Student:** Abdulaziz Abdulrazaq · **ID:** 202023120 · **Course:** SWE 363, Term 261 · **Date:** 21 November 2026

## 1. Tools Used & Use Cases

| Tool | How I used it |
|------|---------------|
| **Claude (Anthropic)**, in the Claude desktop app | My only AI tool for this assignment. Use cases: (1) reading the assignment page and the grading rubric with me and turning every requirement into a feature; (2) code generation on top of my Assignment 2 portfolio; (3) code review and debugging, using automated browser tests and Lighthouse; (4) drafting the documentation; (5) a final check of the work against the rubric, row by row. |

I did not use Copilot, Cursor, ChatGPT or any other AI tool for this assignment.

### How the work was split

**What Claude did**

- Read the Assignment 3 instructions on Blackboard and the rubric on GitHub and mapped each requirement to a feature:
  API integration (GitHub repositories, language mix and activity feed), complex logic (project filter combined
  with sort, audience choice, contact form with extra checks, countdown and time-on-page timer), state
  management (remembered name, audience, theme and draft), performance and compatibility checks.
- Copied my Assignment 2 portfolio as the starting point and wrote the new HTML, CSS and JavaScript.
- Wrote `tests/check_site.py` (48 automated browser checks with a mocked GitHub API), ran it, ran Lighthouse on
  mobile and desktop, and fixed what they found.
- Drafted `README.md`, `docs/technical-documentation.md` and this report.

**What I did**

- Asked Claude to solve the assignment, and to check the Blackboard instructions and the GitHub rubric first,
  so that the repository problem I had in Assignment 2 (a private repository inside the class organisation)
  does not happen again. This repository is public and on my own account.
- Kept the content to my real work: the projects on the page are my senior project, Ala Makth, my ISE 422
  layout project and this website. A fourth project in Claude's first plan, which I could not confirm as
  mine, was removed.
- Reviewed the files, the screenshots and the test results, and went through the key points in section 6
  so that I can explain the code.

## 2. Benefits & Challenges

**Benefits**

- Speed and coverage: one pass over the rubric produced a feature for every row, and the tests caught
  mistakes (for example a failing favicon request) before anyone else could see them.
- Testing I would not have set up alone: Playwright with the GitHub API replaced by fixed data let me check
  failure cases (rate limit, no network, blocked storage) that are hard to trigger on purpose.
- Explanations: every function is described in the technical documentation, which helped me understand
  the code instead of only receiving it.

**Challenges and limits of the AI**

- It does not know my facts. Its first plan contained a project I had not confirmed, and its first countdown
  pointed at a graduation date it had no source for. I removed the project and changed the countdown to
  "days left in 2026", which is true without any outside fact.
- It could not run Firefox or Safari in its test environment, so compatibility with them rests on browser
  support tables, not on a test run. The documentation says this openly.
- It can write confident documentation that is wrong in small details, so every number in the README (Lighthouse
  scores, test count) was copied from a real run and checked again after the last code change.
- Uploading to GitHub through the browser needed several workarounds, because files in folders cannot be
  chosen from the upload page.

## 3. Learning Outcomes

- **JavaScript:** saving and restoring state with `localStorage` safely (`try / catch`), caching API responses
  with a timestamp, validating text with a regular expression (`\p{L}` and the `u` flag), and combining a
  filter and a sort without rebuilding the page.
- **Working with APIs:** the 60 requests per hour limit of the unauthenticated GitHub API, why it needs
  caching, and why every state (loading, error, empty, rate limit) needs its own message.
- **Quality workflow:** write tests that replace the network, read a Lighthouse report, fix one issue at
  a time, and re-measure.
- **Using AI well:** give it the real rubric, check its claims about me, and ask for proof (a test or a
  measurement) instead of trusting a sentence.

## 4. Responsible Use & Modifications

- I did not submit the AI output unchanged. I checked that every project and statement on the page is true,
  removed the invented project and the unsourced graduation date, and checked the documentation against the
  actual test and Lighthouse results.
- The evidence ZIP holds an earlier snapshot of the files, saved during the session (`artifacts/1-earlier-snapshot/`),
  next to the version in this repository (`artifacts/2-submitted-version/`). The very first drafts were overwritten
  while working and were not kept as separate files, so the ZIP README lists the main changes in words.
- AI-assisted commits have an `Assisted-by: Claude (claude-sonnet-5-5)` line in their message. Five early commits
  (the first `README.md` and four SVG images) lack it, because the GitHub web editor dropped my message text; that
  help is declared in this log (A04, A06).
- I read the code and the technical documentation until I could explain each feature (section 6).
- I used no code from classmates, and no other AI tool.

## 5. Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What I changed and how I verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude (Anthropic, claude-sonnet-5-5), Claude desktop app | 2026-11-21 | Read the instructions and rubric, plan, write code, tests and documentation, run Lighthouse, check against the rubric, prepare the repository | all files below | One conversation. I set the direction and reviewed the result (section 4). The same chat also holds earlier, unrelated work for other courses. The evidence ZIP contains the Assignment 3 part from my first message about the assignment: every message word for word (`C01b`) and the tool actions in detail for the part after the app's automatic summary (`C01`); for the part before it, the tool inputs are only summarised. |
| A01 | Claude | 2026-11-21 | New sections and controls: name form, quick facts, audience picker, project filters, GitHub extras, topic field, noscript note, favicon | `index.html` | Checked that every project and claim is about my real work; the unconfirmed fourth project was replaced by this website. Verified with the automated checks and screenshots. |
| A02 | Claude | 2026-11-21 | All new JavaScript features (section 4 of the technical documentation) | `js/script.js` | Read against the technical documentation; the countdown target was changed from an unsourced date to the end of 2026. Verified with the automated checks, including the failure cases. |
| A03 | Claude | 2026-11-21 | Styles for the new parts, in the existing colour tokens so dark mode works | `css/styles.css` | Checked desktop light, desktop dark and mobile screenshots. |
| A04 | Claude | 2026-11-21 | New placeholder images, and removal of large hidden metadata from the three existing SVG images | `assets/images/*.svg` | Looked at them on the page; the avatar file went from 8.3 KB to 0.5 KB with no visible change. |
| A05 | Claude | 2026-11-21 | Automated checks | `tests/check_site.py` | Ran it until all 48 checks passed; read what each check proves. |
| A06 | Claude | 2026-11-21 | Documentation drafts and a final rubric check that added the compatibility section and the sections of this report | `README.md`, `docs/technical-documentation.md`, `docs/ai-usage-report.md` | Checked every number against the real runs. I made sure this report lists only what actually happened. |

The AI evidence (the conversation messages, unedited, and the files from before my final edits) is
in `202023120-AbdulazizAbdulrazaq-assignment3-ai-evidence.zip`, submitted on Blackboard with the repository
link and not committed to this repository.

## 6. How I verified the result, and key points I can explain

| Check | How |
|-------|-----|
| Automated tests | `python tests/check_site.py`: 48 checks in Chromium with a mocked GitHub API; includes a description containing an `<img onerror>` tag to confirm it is shown as text |
| Lighthouse 12.8 | Mobile and desktop: 100 / 100 / 100 / 100 (performance, accessibility, best practices, SEO) |
| Visual review | Desktop light, desktop dark and mobile screenshots of the whole page |
| Live site | After the upload, opened the public GitHub Pages address and checked the repository list, language mix and activity feed |

Key points from the AI output that I can explain:

- **State that survives a reload:** the visitor name, audience choice, theme and contact draft are saved in
  `localStorage`. Every access goes through three small helper functions with `try / catch`, because storage
  can be blocked (private browsing); the page then simply forgets between visits.
- **Validating a name with a regular expression:** `/^[\p{L}][\p{L} .'-]{1,29}$/u` means: the first character
  is a letter in any language, then 1 to 29 letters, spaces, dots, hyphens or apostrophes. `\p{L}` and the
  `u` flag make it work for Arabic names too.
- **Filter and sort together:** the cards stay in the page. The code sorts them, hides those outside the chosen
  category and appends them back in order. Moving existing elements (instead of rebuilding them) keeps each
  card's open or closed state.
- **Disabled Send button:** `isFormValid()` runs the four rules silently on every change and sets
  `button.disabled`. Messages only appear when a field is left, so the form does not warn someone who has just
  started typing.
- **Caching two API calls:** the GitHub API allows 60 requests per hour without a token, so repositories and
  activity are cached for 30 minutes with a timestamp. If GitHub fails later, the old copy is shown.
- **Safe rendering:** all API text is added with `textContent`, never `innerHTML`, so a repository description
  with HTML in it is shown as plain text.
- **Language share:** repositories are counted per language and each bar is `round(count / total × 100)` percent wide.
- **Testing without the network:** Playwright intercepts the requests to `api.github.com` and answers with fixed
  data, so the tests repeat exactly and can simulate a rate limit.
- **Performance:** no framework or font, three small files, lazy images with fixed sizes (no layout shift),
  cached API responses, small SVG files and a favicon (so no failing request).

### Creative uses of AI in this assignment

- The AI was used as a **rubric auditor**: after the first build it re-read the grading table and listed the
  rows that were not yet covered. That is how the missing report sections and the compatibility evidence were found.
- The AI was used to **build a test harness** that replaces the GitHub API, so failures can be tested on purpose.
- The AI was used in a **measure, fix, measure again** loop with Lighthouse (the first run showed one failing
  request; the second run was 100 in all four categories).

## 7. Declaration

I declare that this report and the attached evidence document all of my AI use in this assignment, with
complete and unedited conversations, and that I understand and can explain all the code I submitted. I
understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM
regulations.

**Name:** Abdulaziz Abdulrazaq
**Student ID:** 202023120
**Date:** 21 November 2026
