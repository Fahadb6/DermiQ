# DermiQ — The Science of Precision · علم الدقة

> **Concept prototype.** Fictional demo data. Not an approved medical device, not a clinical system and not medical advice.
> All people, clinics, values and records shown are invented for demonstration.

DermiQ is a design concept: a **mechanical treatment pen** with a dual-chamber cartridge and a single treatment head, plus a
**physician-supervised digital platform**. This repository contains the working front-end prototype of the platform:

| Experience | Entry route | Who it is for |
|---|---|---|
| Public website | `/#/` | Everyone — introduces the concept, the product and the design philosophy |
| Patient application | `/#/patient` | Patients — approved plan (read-only), session documentation, progress photos, reminders |
| Physician portal | `/#/physician` | Physicians — plan configuration, approval and digital lock, reviews, appointments, content |
| Patient Education Center | `/#/guide` and `/#/patient/education` | Shared library, medically reviewed (simulated) before publication |

Arabic is the default language (right-to-left); English is one click away and every screen exists in both.

---

## البدء السريع

```bash
npm install
npm run dev        # خادم التطوير على http://localhost:5173
npm run build      # فحص الأنواع ثم بناء الإنتاج في dist/
npm run preview    # معاينة نسخة الإنتاج على http://localhost:4173
```

أسهل طريقة للتجربة بلا أي تثبيت: افتح الملف `release/DermiQ-standalone.html` مباشرة في المتصفح.

كلمة المرور لكل الحسابات التجريبية: `Demo#2026` — وفي صفحتي الدخول أزرار تملأ البيانات تلقائيًا.
البيانات كلها وهمية ومحفوظة في متصفحك فقط، ويمكن إعادتها إلى حالتها الأولى من «الإعدادات ← إعادة ضبط البيانات التجريبية».

## Quick start

Requires Node.js 18+ (built and tested on Node 20).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build on http://localhost:4173
```

The build is fully static. Routing uses the URL hash and asset paths are relative (`base: './'`), so `dist/` can be dropped
on any static host or sub-folder with no rewrite rules. It must be served over HTTP(S); browsers do not load ES modules
from `file://`. A ready-made build with a zero-dependency server is in `release/site/` (`node serve.mjs`).

### Publishing (Netlify and other static hosts)

A static host serves the `index.html` it finds **at the top level of the folder you upload**. If the website sits one
folder down, the host answers “Page not found” at `/` and the site is reachable only under that sub-folder.

- Upload the folder that directly contains `index.html`: `dist/`, `release/site/`, or either archive in `release/`
  after unzipping. Both `DermiQ-Complete-Package.zip` and `DermiQ-site.zip` keep `index.html` at their top level and
  have no wrapper folder, so the unzipped folder is the folder to upload.
- `public/_redirects` and `public/404.html` are copied into every build: an address that is not a real file returns
  to the home page. In the complete package, `_redirects` also keeps `source/`, `docs/`, `README.txt` and `serve.mjs`
  away from visitors.
- `node qa/deploy-check.mjs <folder | file.zip>` answers “will this work if I upload it?” before you do. It serves
  the folder through `qa/netlify-sim.mjs`, a local approximation of Netlify’s rules.
- `python3 tools/make-package.py` rebuilds both archives from `release/site/` and refuses to write one whose top level
  has no `index.html`.

### No server at all

`release/DermiQ-standalone.html` is the whole prototype in **one file** (about 3.3 MB: code, fonts and images inlined).
Double-click it, or open it in any HTML preview — it needs no server and no network. Rebuild it with
`npm run build:standalone`. Inside a sandboxed preview frame it keeps its data in memory only; opened from disk it
behaves like the served version.

## Demo accounts

Password for every account: `Demo#2026`. The sign-in pages list these accounts as one-click buttons.

| Role | Name | Email | ID | Seeded state |
|---|---|---|---|---|
| Physician | Dr. Lina Al-Harbi | `dr.lina@dermiq.demo` | `DQ-DR-01` | Six patients, items waiting in every queue |
| Patient | Sara Al-Qahtani | `sara@dermiq.demo` | `DQ-P-1001` | Plan approved and digitally locked (rev. 2); one past session waiting to be documented |
| Patient | Faisal Al-Otaibi | `faisal@dermiq.demo` | `DQ-P-1002` | Plan approved (rev. 1); a reported session and a photo await review |
| Patient | Noura Al-Zahrani | `noura@dermiq.demo` | `DQ-P-1003` | Plan complete, **awaiting approval** — the patient sees nothing yet |
| Patient | Khalid Al-Ghamdi | `khalid@dermiq.demo` | `DQ-P-1004` | Draft plan, consultation booked |
| Patient | Reem Al-Shehri | `reem@dermiq.demo` | `DQ-P-1005` | Plan re-opened (**requires review**); missed sessions; overdue follow-up |
| Patient | Omar Bakr | `omar@dermiq.demo` | `DQ-P-1006` | Plan locked (rev. 3); a reported session awaits review |

The session is stored per browser tab, while the data is shared across tabs. Open the physician portal in one tab and the
patient app in another to watch an approval appear on the patient side without reloading.

## Suggested walkthrough

1. Open the site (Arabic, RTL) and switch to English from the header.
2. Search the Patient Guide; note that patient-only articles are locked for visitors.
3. Sign in as Dr. Lina → open **Noura Al-Zahrani → Configuration**. The preview panel shows the patient sees nothing.
4. In a second tab sign in as Noura: “Your plan is being prepared”, no dose anywhere.
5. Physician: choose a dose, save, **Review Changes**, **Approve Treatment Plan** → the patient tab updates live, read-only.
6. Physician: **Digitally Lock** → inputs become read-only. **Update Plan** re-opens it; the patient keeps seeing the last
   approved version until the new one is approved.
7. Physician: create an appointment → it appears in the patient’s reminders with an in-app notification.
8. Sign in as Sara: **Start Session** opens an educational walkthrough and records nothing.
9. Sara documents the past session manually (confirmation checkbox required) → the physician reviews it and leaves a note.
10. Sara adds a progress photo (a synthetic sample is provided), the physician marks it reviewed, Sara compares two dates.
11. Physician → **Education content**: move an article through review → approval → publication → archive; every step needs a
    note and is written to the article history.

## Project structure

```
src/
  app/            Router, role guards, lazily-loaded patient and physician areas
  layouts/        PublicLayout, PatientLayout, PhysicianLayout
  features/       public/  education/  authentication/  patient/  physician/
  components/     brand/  ui/  product/  domain/  charts/
  services/       db.ts (store + business rules), auth.ts, i18n.ts, selectors.ts, storage.ts
  data/           seed.ts, product.ts, faq.ts, education.ts
  locales/        en/ and ar/ (ar is type-checked against en, so a missing key fails the build)
  types/          the data model
  assets/         product imagery (single import point: assets/index.ts)
  styles/         Tailwind entry + design tokens
public/           demo/ (synthetic progress photos), _redirects and 404.html (hosting rules, copied into every build)
docs/             architecture, data model, design system, governance, security, assets, QA
qa/               Playwright scripts: end-to-end flow, route crawl, width sweep, contrast audit, mobile menu, hero and sign-in layouts, upload check
tools/            make-standalone.mjs, make-package.py (+ package/: the README and hosting rules of the archive), asset-pipeline/ (provenance only)
```

## Quality checks

```bash
npm run typecheck
# browser checks (one-off setup: npm i -D playwright && npx playwright install chromium)
npm run dev &
node qa/e2e.mjs        # 20-step flow across the site, the physician portal and the patient app
node qa/crawl.mjs public && node qa/crawl.mjs patient && node qa/crawl.mjs physician
node qa/contrast.mjs   # WCAG AA text-contrast audit
node qa/no-storage.mjs # the app still works when Web Storage is blocked
node qa/standalone.mjs # the single-file build: sandboxed frame (offline) and file://
node qa/menu.mjs       # the mobile menu opens, lists every page, navigates and closes
node qa/hero-fit.mjs   # home statement: one sentence per line, pen level and whole, 320–1920 px
node qa/login-fit.mjs  # sign-in pages: illustration and panel text fit at eight viewport sizes
node qa/widths.mjs all # no horizontal overflow on any route at 15 widths (about four minutes)
node qa/deploy-check.mjs release/DermiQ-Complete-Package.zip   # the archive works when uploaded as it is
```

Results of the last run are in [`docs/QA_REPORT.md`](docs/QA_REPORT.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the application is put together and how it would grow a back end
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — entities, state machines and business rules
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens, typography, components, RTL and accessibility rules
- [`docs/MEDICAL_CONTENT_GOVERNANCE.md`](docs/MEDICAL_CONTENT_GOVERNANCE.md) — what the product may and may not say
- [`docs/SECURITY_NOTES.md`](docs/SECURITY_NOTES.md) — what is simulated and what production would require
- [`docs/ASSETS_AND_REFERENCE_NOTES.md`](docs/ASSETS_AND_REFERENCE_NOTES.md) — imagery provenance, retouching, open discrepancies
- [`docs/QA_REPORT.md`](docs/QA_REPORT.md) — what was tested and what is known to be missing

## Limits of this prototype

No server, no real authentication, no real notifications (in-app only), no connection to the pen (it is mechanical), no
clinical validation, and no regulatory status. Photos and records never leave the browser. Do not enter real patient data.
