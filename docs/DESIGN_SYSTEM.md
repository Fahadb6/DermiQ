# Design system

The visual language is that of a precision instrument: quiet surfaces, exact alignment, one accent colour, and technical
annotation used sparingly. It is meant to read as a medical-device brand, not as a consumer wellness app.

## Colour tokens (`tailwind.config.js`)

| Token | Value | Use |
|---|---|---|
| `aubergine` | `#211329` (900 `#1A0F21` → 500 `#5E4772`) | Hero and feature backgrounds, the patient “next session” card |
| `ink` | `#17151C` (800 `#211F28`, 700 `#2D2A36`, 600 `#3D3947`) | Body text, physician sidebar, footer |
| `brand` | `#5B2393` (700 `#4B1C7B`, 400 `#8257B4`, 300 `#A98AD0`) | The DermiQ purple — primary actions, links, active states |
| `lavender` | `#DCD1E8` (100 `#F3EEF7`, 200 `#EAE2F1`) | Tinted surfaces, informational notices |
| `ivory` | `#FBF9F5` | Page background; text on dark surfaces |
| `porcelain` | `#F4F0E9` (200, 300) | Alternate section background, application canvas |
| `stone` | 100 `#EEEAE4` → 800 `#4A4643` | Borders (100–400) and secondary text (**700 or darker only**) |
| `metal` | `#B59A78` (300, 600, 700) | Fine rules, the remaining part of progress bars, small highlights |
| `ok` / `warn` / `bad` | `#2F6B55` / `#82570E` / `#9C3A3A`, each with a `bg` tint | Status only — never decoration |

Rules: one accent per view; status colours always travel with an icon and a text label; `stone-600` and lighter are not
used for text on light surfaces (below 4.5:1); on dark surfaces secondary text is `ivory` at 60% or more.

## Typography

| Role | Latin | Arabic |
|---|---|---|
| Display (headings, large figures) | Fraunces (variable, optical size) | Alexandria (variable) |
| Interface and body | Manrope (variable) | IBM Plex Sans Arabic |
| Technical labels, IDs, values | IBM Plex Mono | IBM Plex Mono for Latin IDs, Plex Sans Arabic for words |

- All fonts are bundled; nothing is fetched from a CDN.
- `--font-display` switches with the language. Display weights are light in Latin and medium in Arabic so the two feel
  equally weighted.
- Tracking and uppercase (`.eyebrow`, `.tech`) apply to Latin only. In Arabic the same roles use weight and colour.
  `.tech` is for Latin-only strings (IDs, figure numbers, units); anything translated uses `.eyebrow`.
- `.d-hero` is the home statement: three short sentences, one per line, the third in lavender. Its size follows the
  viewport width so that no sentence wraps, from a 320 px phone to a wide desktop, in both scripts.
- Secondary text is `stone-700`. `stone-600` passes AA only at display sizes and is reserved for them.
- Numbers that are compared (doses, dates, counts) use tabular figures (`.num`).
- Arabic line-height is looser than Latin (`leading-relaxed` minimum for body text).

## Layout

- Content width `max-w-page`; reading width `max-w-read`.
- A 12-column grid on desktop that collapses to a single column; no horizontal scrolling at 360 px and above. Wide tables
  scroll inside their own container.
- Radii: generous in the patient app (softer, calmer); tight in the physician portal (denser, more tool-like).
- Elevation is rare: `shadow-plate` for product plates, `shadow-lift` for overlays. Borders do most of the work.

## The three registers

| | Public website | Patient app | Physician portal |
|---|---|---|---|
| Mood | Editorial, dark hero, large type | Calm, roomy, one thing at a time | Dense, tabular, scannable |
| Navigation | Top bar + drawer | Side rail (desktop), bottom tabs (mobile) | Dark sidebar (desktop), drawer (mobile) |
| Primary colour block | Aubergine | Ivory with one aubergine card | Ink sidebar, ivory canvas |
| Typical element | Annotated product figure | Next-session card, read-only plan | Tables, queues, diff view |

## Components

- **Brand** — wordmark, nine-dot glyph (the 3 × 3 array), section numbers.
- **UI** — `Button` (primary, dark, outline, ghost, soft, danger, ok, plus light variants for dark surfaces; `square`
  option for the portal), `IconButton`, `Modal` (focus-trapped, Esc to close, returns focus), `Confirm`, `Toast` (polite
  live region), `Field`, `Toggle`, `Segmented`, `Pagination`, `Notice`, `Badge`, `Avatar`, `Empty`, `LangSwitch`, `Ltr`.
- **Domain** — `PlanPill`, `SessionPill`, `SourceTag` (“Patient-reported”), `ApptTypeBadge`, `ArticlePill`, `DateBlock`,
  `PhotoThumb`, `PhotoCompare`, `NotificationList`.
- **Charts** — `StackBar`, `ColumnChart`, `HBarList`, `Legend`. Plain HTML/CSS, direction-aware, every value also present
  as text. No chart is used to imply a clinical outcome.
- **Product figures** — `AnnotatedFigure` and `PenAnnotated` (numbered hotspots with a text legend), `PenRuler`,
  `DrawingFrame`, `HeadTile`, `ConformArc` (schematic).

## Product imagery

- Images come only from the supplied reference material (see `ASSETS_AND_REFERENCE_NOTES.md`). They are never redrawn,
  re-rendered by AI, or mirrored in RTL.
- The pen is always shown level and whole — on a phone it is the same figure as on a desktop, only smaller.
- The four cartridge stages are 3 : 5 tiles on the sheet’s own lavender (`#E5E0F3`), two per row on a phone and four on a
  desktop.
- Annotation is drawn by the interface (numbered markers + legend), not baked into the image, so it translates.
- Every figure that shows a concept state carries a “conceptual” caption.

## Illustration

People appear only on the two sign-in pages: a patient on Patient Access, a physician on Physician Access. The drawings
are flat, in the site palette, inside an arch on the aubergine panel (desktop) or a band above the form (phone and
tablet). They are identical in both languages and are never used to depict the product.

## Overlays

The site header slides out of view on scroll, so it always carries a CSS transform — and a transformed element becomes
the containing block of any `position: fixed` descendant. Full-screen overlays (the mobile menu) are therefore rendered
as siblings of the header, never inside it.

## Motion

Short and functional: 200–500 ms, one easing curve (`ease-precise`), opacity and small translations only. Content reveals
once on scroll. With `prefers-reduced-motion` everything is shown immediately and transitions are disabled.

## Accessibility

- Target: WCAG 2.1 AA. Text contrast is audited automatically (`qa/contrast.mjs`).
- One `h1` per page; headings in order; landmarks (`header`, `nav`, `main`, `footer`); skip link.
- Every interactive element is keyboard reachable with a visible focus ring; modals trap and restore focus.
- On navigation the page title updates, scroll resets and focus moves to the main content.
- Forms: visible labels, errors linked with `aria-describedby`, no colour-only states.
- Status is never colour alone: icon + text label.
- Primary touch targets are at least 40 px high; the mobile tab bar respects the safe-area inset.
- `lang` and `dir` are set on `<html>`; mixed-direction fragments (IDs, emails, units) are isolated.
