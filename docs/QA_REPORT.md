# QA report

Last run: 11 November 2026 · Chromium (Playwright) · Node 20 · against the production build (`release/site`) and the single-file build.

## Summary

| Check | Scope | Result |
|---|---|---|
| Type check | `tsc --noEmit`, strict mode, Arabic locale typed against English | Clean |
| Production build | `vite build` | Clean — see sizes below |
| Route crawl | 42 routes × Arabic/English × 1440 px/390 px = 168 page loads, production build | **All clean** |
| End-to-end flow | 20 steps, two tabs (physician + patient) through the real UI, production build | **20 / 20 pass** |
| Text contrast | 10,695 text nodes, 33 routes × 2 languages × 2 viewports, WCAG 2.1 AA | **0 failures** (one false-positive group, explained below) |
| Mobile menu | `qa/menu.mjs` — the menu button at 390 px and 820 px, Arabic and English: opens, covers the screen, lists every page, navigates, works after scrolling, closes with Escape | **16 / 16 pass** |
| Sign-in pages | `qa/login-fit.mjs` — 2 roles × 2 languages × 8 viewports (360–1920 px): the right illustration shown and loaded, panel statement on three single lines, nothing overlaps, no horizontal scroll | **32 / 32 pass** |
| Home statement | `qa/hero-fit.mjs` — 20 widths from 320 to 1920 px, Arabic and English: each of the three sentences on one line, pen level, whole and undistorted, introduction visible, no horizontal scroll | **40 / 40 pass** |
| Width sweep | `qa/widths.mjs` — every route of the crawl × 2 languages × 15 widths from 320 to 1920 px, horizontal overflow only | **1,260 layouts clean** |
| Upload check | `qa/deploy-check.mjs` on both archives, unpacked the way a host receives them and served through `qa/netlify-sim.mjs` (a local approximation of Netlify’s rules — not Netlify itself): `index.html` at the top level, every referenced file present, `/` opens, wrong addresses return home, package-only files hidden, home / menu / sign-in / product render in a browser | **All pass** — and the 20-step flow passes against the unpacked complete package |
| Single-file build | `release/DermiQ-standalone.html` in a sandboxed frame (`allow-scripts` only, offline; `srcdoc` and `blob:`) and from `file://` | **All pass** — sign-in, approval, notes, photos, language switch |
| Storage blocked | Web Storage throwing on access | App works with in-memory state, no errors |
| Visual review | Contact sheets, desktop and mobile, both languages, a sample of screens from all four experiences | Reviewed; findings fixed |

### Build output

| Chunk | Size | Gzip |
|---|---|---|
| `index` (public site, shared code, locales) | 308 kB | 101 kB |
| `react` (vendor) | 168 kB | 55 kB |
| `PhysicianArea` (lazy) | 77 kB | 20 kB |
| `PatientArea` (lazy) | 47 kB | 12 kB |
| `Photo` (shared, lazy) | 16 kB | 5 kB |
| CSS | 72 kB | 17 kB |

Whole `dist/` including fonts and images: about 3 MB.

## Route crawl (`qa/crawl.mjs`)

For every route, in both languages and both viewports, the crawl asserts:

- no console errors or warnings and no uncaught exceptions;
- no horizontal page overflow;
- exactly one `h1`;
- no leaked placeholder text (`undefined`, `NaN`, `[object Object]`, `Invalid Date`);
- `<html lang>` and `dir` match the language;
- no unexpected redirect.

Patient routes are visited as three patients in different plan states (locked, draft, requires review); physician routes
include each tab of the patient record.

## End-to-end flow (`qa/e2e.mjs`)

1. Public site opens in Arabic, right-to-left
2. Language switch to English persists after reload
3. Guide search finds articles; a patient-only article is locked for visitors
4. Protected route redirects to sign-in; a wrong password and the wrong portal are refused
5. Physician signs in
6. Pending plan: nothing is visible to the patient yet
7. Patient (second tab) sees “being prepared” and no dose; both sessions coexist
8. Save configuration and review changes; the draft stays hidden from the patient
9. Physician approves the plan
10. Patient sees the approved plan, read-only — updated across tabs without a reload
11. Digital lock: the configuration becomes read-only in the software
12. Patient sees the plan as approved and digitally locked
13. Update plan: the patient keeps the last approved version while changes await approval
14. Re-approval publishes revision 2 to the patient
15. Physician schedules an appointment; the patient sees it and receives an in-app notification
16. “Start Session” walkthrough is educational — it records nothing
17. Patient reports a session manually (confirmation required) → pending physician review
18. Physician reviews the patient-reported session; the patient sees the note
19. Progress photo: upload → physician review → side-by-side comparison (no analysis)
20. Content governance (review → publish → archive) controls visibility; role guards and sign-out hold

## Contrast audit (`qa/contrast.mjs`)

Computes the effective colour of every visible text node (including opacity and alpha) against its composited background
and compares it with 4.5:1 (3:1 for large text). The only remaining reports are the public header links at the top of a
page: the header is transparent there and sits over the aubergine hero, which is a sibling rather than an ancestor, so the
script cannot see it. Checked separately with `elementsFromPoint`: ivory on `#211329`, above 15:1; once the page scrolls
the header becomes solid aubergine.

## Fixed on 11 November 2026 (owner review)

- **“Page not found” after uploading the package to Netlify.** The complete package kept the website in a `site/`
  sub-folder, so the uploaded folder had no `index.html` at its top level: `/` answered 404 while the site was
  actually live under `/site/` (confirmed on the owner’s deployment). The package now *is* the website — `index.html`,
  `assets/` and `demo/` are at its top level, with `source/`, `docs/` and the single-file build beside them and hidden
  from visitors by `_redirects`. `qa/deploy-check.mjs` fails on the old layout with exactly that diagnosis and passes on
  the new one; `tools/make-package.py` refuses to write an archive without a top-level `index.html`.

- **The menu button on phones did nothing.** The full-screen menu was a `position: fixed` panel *inside* the header. The
  header carries a transform (it slides away on scroll), which makes it the containing block for fixed descendants, so the
  panel was laid out inside the 64 px header and collapsed to zero height: the button toggled, nothing appeared. The panel
  is now rendered beside the header instead of inside it. `qa/menu.mjs` reproduces the fault on the old build (12 checks
  fail) and passes on this one; the earlier suite never tapped that button, which is why it was missed.
- **Pen on phones.** The cropped, tilted pen in the phone hero is replaced by the same level, complete figure as on desktop.
- **Cartridge views.** The two workflow frames are replaced by the four stages of the owner’s cartridge sheet (see
  `ASSETS_AND_REFERENCE_NOTES.md`).
- **Sign-in pages.** Product close-ups replaced by a patient illustration and a physician illustration.
- **Copy.** New home statement, introduction and closing lines, as supplied by the owner.
- Patient walkthrough: the Arabic step counter used the Latin-only `.tech` style, which set it left-to-right and
  letter-spaced; it now uses `.eyebrow`.
- Found by the new width sweep (the route crawl looks only at 1440 px and 390 px, so these had gone unnoticed):
  the “Connected experience” row on the home page overflowed in English between 1024 and 1279 px — it now stacks
  below 1280 px; and on a 320 px screen, in English, the plan-status pill and the “Mark all as read” button pushed the
  patient pages wider than the screen — both rows now wrap.

## Fixed during QA

- Horizontal overflow on seven pages at 390 px (grid tracks growing to content, visually-hidden text escaping scroll
  containers, a category scroller with oversized negative margins).
- Secondary text raised from `stone-600` to `stone-700`; secondary text on dark surfaces raised to 60 % ivory; warning
  colour darkened to `#82570E`; decorative index numbers no longer dimmed below AA.
- Patient home card: treatment-head ID no longer wraps on narrow screens.
- Skip link: with hash routing, `#main` was read as a route and led to the not-found page; it now moves focus to the
  main content.
- Synthetic progress photos regenerated to remove a radial artefact in the hair direction.

## Not covered — please read

- **Browsers.** Tested in Chromium only. Safari and Firefox were not available in the build environment. Native date and
  time inputs follow the browser’s own locale format.
- **Assistive technology.** Structure, focus order, labels and contrast are checked; no session with a real screen reader
  was run.
- **Unit tests.** None. Business rules are exercised through the end-to-end flow.
- **Storage quota.** Photos are stored as data URLs in `localStorage`; after a few dozen uploads the browser quota can be
  reached, which the app reports as a storage error.
- **Clock.** Demo data is dated relative to the day it is first created in the browser. If the prototype is revisited days
  later, upcoming items will have become due; “Reset demo data” in Settings re-anchors everything to today.
- **Language review.** Arabic and English copy were written for this prototype and have not been through professional
  medical translation or clinical review.
- **Everything in `SECURITY_NOTES.md`.** There is no real authentication or data protection.
