# Architecture

## Shape

A single-page application, entirely client-side, built as static files.

| Concern | Choice | Why |
|---|---|---|
| Build | Vite 5 + TypeScript (strict) | Fast, static output, `tsc --noEmit` gates every build |
| UI | React 18, function components | — |
| Styling | Tailwind CSS 3.4 with project tokens | Logical properties (`ms-`, `pe-`, `start-`) give RTL for free |
| Routing | react-router-dom 6, `HashRouter` | Works on any static host and sub-path with no rewrite rules |
| State | zustand store over `localStorage` | Stands in for a back end; one place for every business rule |
| Icons | lucide-react | — |
| Fonts | Self-hosted through `@fontsource` | No third-party requests; works offline |

No analytics, no trackers, no network calls at runtime.

## Layers

```
features/*  (screens)           read through selectors, write through store actions only
   │
components/*                    presentational: ui, domain (status pills, photos, notifications), charts, product figures
   │
services/selectors.ts           pure derivations: session views, adherence, attention queue, what a patient may see
services/db.ts                  the store — every mutation, every rule, every notification side-effect
services/auth.ts                simulated session (sessionStorage, per tab)
services/i18n.ts                language, direction, formatting helpers
services/storage.ts             safe wrappers around localStorage / sessionStorage
   │
data/seed.ts                    deterministic demo data, dated relative to “today”
types/index.ts                  the data model
```

Screens never mutate data directly. They call a store action and receive
`Result<T> = { ok: true, value } | { ok: false, error }`, where `error` is one of
`forbidden | not_found | locked | incomplete | invalid_state | not_due | invalid | storage`. Each code has a localized
message (`t.err[code]`). Actions re-check the acting role and the current state themselves, so the rules hold even if a
screen forgets to disable a button.

## Routing and access

- `App.tsx` declares public routes eagerly and loads `PatientArea` and `PhysicianArea` lazily, so a visitor never downloads
  the portal code.
- `RequireRole` wraps each area. A missing or wrong role redirects to `/login/<role>` and remembers where the user was going.
- `RouteEffects` resets scroll, moves focus to the main content and sets the document title on every navigation.
- A patient account cannot open the physician area and vice-versa; the store rejects cross-role actions as well.

## Persistence

| Key | Storage | Content |
|---|---|---|
| `dermiq.db` | `localStorage` | The whole demo database (versioned) |
| `dermiq.lang` | `localStorage` | `ar` or `en` |
| `dermiq.session` | `sessionStorage` | Signed-in user for this tab, 8-hour expiry |

The store listens to the `storage` event, so two tabs stay in sync: an approval in the physician tab appears in the patient
tab immediately. “Reset demo data” in either Settings screen restores the seed.

## Three places it runs

`src/utils/embed.ts` lets one codebase run in three environments:

| Environment | Routing | Data | Notes |
|---|---|---|---|
| Web server (`dist/`, `release/site/`) | `HashRouter` | `localStorage` / `sessionStorage` | The normal case |
| File opened from disk (`release/DermiQ-standalone.html`) | `HashRouter` | `localStorage` / `sessionStorage` | Everything inlined; no network |
| Sandboxed preview frame (same file) | `MemoryRouter` | In memory only | The browser blocks storage and form submission there |

- On a static host the folder that is uploaded must have `index.html` at its top level. `public/_redirects` and
  `public/404.html` travel with every build so that an address which is not a real file returns to the home page;
  the app itself only ever needs `/`, because its routes live after the `#`.
- Storage access is wrapped; when it throws, the app keeps working with in-memory state.
- When the document has no real URL (`about:srcdoc`, `blob:`), routing switches to `MemoryRouter`.
- A sandbox without `allow-forms` never fires `submit`; a one-time probe detects that and re-creates the event from
  submit-button clicks and Enter. Nothing is patched when forms work normally.
- In-page anchors (the skip link) are handled explicitly so that `#main` is never mistaken for a route.

The single file is produced by `vite.standalone.config.ts` (one chunk, all assets inlined) and
`tools/make-standalone.mjs` (folds script, styles, demo images and favicon into the HTML).

## Internationalisation

- `locales/en/*` is the source; `locales/ar/*` is typed against it, so a missing or extra key is a compile error.
- `<html lang dir>` follow the chosen language. Layout uses logical properties throughout; nothing is mirrored by hand.
- Product images are never mirrored. IDs, emails and Latin model names are wrapped in an LTR isolate.
- Dates use the Gregorian calendar with Latin digits in both languages (`ar-SA-u-ca-gregory-nu-latn`) so that a date reads
  the same to patient and physician.
- Letter-spacing and uppercase are never applied to Arabic text (they break letter joining).

## Moving to a real back end

The seam is `services/db.ts`. Each action maps to one endpoint:

| Store action | Would become |
|---|---|
| `saveConfiguration`, `approvePlan`, `lockPlan`, `reopenPlan` | `PUT /patients/:id/plan`, `POST …/plan/approve`, `…/lock`, `…/reopen` |
| `reportSession`, `markSessionMissed`, `reviewSession` | `POST /sessions/:id/report`, `…/missed`, `…/review` |
| `addPhoto`, `deletePhoto`, `reviewPhoto` | `POST /photos` (object storage), `DELETE /photos/:id`, `POST /photos/:id/review` |
| `createAppointment`, `updateAppointment`, `cancelAppointment` | `/appointments` |
| `transitionArticle` | `POST /articles/:id/transitions` |
| `markRead`, `markAllRead`, `set…Prefs` | `/notifications`, `/me/preferences` |

Rules that live in the store today (state transitions, “patient sees only the approved snapshot”, role checks) must be
enforced on the server; the client checks then become a courtesy. See `SECURITY_NOTES.md`.
