# Assets, retouching and reference notes

## Source

All product imagery is derived from reference material supplied by the project owner:

- the reference renders supplied with the brief (pen, cartridge, treatment head, packaging);
- the sheet **“DermiQ — External Cartridge Preparation & Pen Integration”** (5472 × 3072 px, five stages), supplied on
  11 November 2026 as the reference for the cartridge views. It replaces the two workflow frames used before.

No product image was redrawn, re-rendered or upscaled with generative AI; the geometry of the pen, cartridge, head and
packaging is exactly as supplied. Processing was limited to cropping, background clean-up, colour-neutral corrections and
removal of baked-in text, done with scripted image operations (`tools/asset-pipeline/`, kept for provenance — paths inside
refer to the original workspace).

The only generated artwork in the project is the pair of sign-in illustrations, which show people and no product — see
“Sign-in illustrations” below.

## Exported assets (`src/assets/product/`, WebP)

| File | Shows | Typical use |
|---|---|---|
| `pen.webp` | The pen with cartridge installed, cut out | Home hero, About, Product |
| `pen-cartridges.webp` | Pen beside cartridges | Product, education |
| `cartridge.webp` | Dual-chamber cartridge | Home, Product |
| `stage-separated.webp`, `stage-twist.webp`, `stage-mixed.webp`, `stage-detached.webp` | Stages 1–4 of the cartridge sheet: before mixing, external mixing (gloved hand turning the collar), after mixing, upper chamber lifted off | Product (“Four views of the cartridge”); stages 1 and 3 in the patient walkthrough |
| `head-34.webp`, `head-side.webp`, `head-top.webp`, `head-array.webp`, `head-macro.webp` | Treatment head views | Home, Product, plan screens |
| `packaging.webp`, `packaging-window.webp` | Packaging concept | Product |

## Retouches made

| Change | Reason |
|---|---|
| “0.5 **mg**” → “0.5 **mL**” on the pen’s dose window | The pen meters volume; the unit on the render contradicted the rest of the concept |
| Blue-tinted liquid neutralised to clear — pen and cartridge renders of the first reference set only | The concept describes a clear solution; the tint read as a different product. **Not** applied to the four stage tiles: there the blue of the mixed solution is kept exactly as the sheet shows it (see discrepancy 8) |
| Garbled micro-text on the cartridge and the misspelt “TWIET TO MIX” cleaned | Illegible or misspelt render text |
| Labels and leader lines removed from head views and concept frames | Annotation is now drawn by the interface so it can be translated |
| Background removed from the hero pen | To sit on the aubergine hero |
| Stage tiles: the sheet’s English captions, brackets, leader lines and column rules removed; each stage re-framed as an equal 3 : 5 tile on the sheet’s own background | Captions are drawn by the interface so that they can be translated. Every other pixel of the cartridge is the sheet’s pixel |
| Stage 2: the caption printed across the glove removed, and the glove surface behind it refilled | The caption sat on the gloved hand, not on the cartridge; only the glove was repainted |
| Stage 4: collar print “TWIS**Y** TO MIX” → “TWIS**T** TO MIX”, re-using the T of the same line | Misspelling on the sheet; stages 1–3 print it correctly |

### How the stage tiles are produced

`tools/asset-pipeline/prep3.py` (helpers in `prep2.py`) works in “sheet units” (sheet width = 1568). For each stage it
declares the rectangles that hold captions and the exact position of every leader line. Caption rectangles are replaced
by the sheet background fitted around them (a plane plus the local residual); leader lines are refilled column by column
from the pixels directly above and below, so glass walls, collar ribs and highlights that cross a line continue unbroken.
Nothing is detected or guessed, and the output is identical on every run.

## Discrepancies in the reference material

Items 1 and 2 were confirmed by the project owner on 10 November 2026; the handling described below is final.

1. **Needle count.** The drawing sheet label and the needle-side view show **3 × 3 = 9**, which the prototype treats as
   canonical. Two views appear to show five across (a diagonal view of the same grid). One panel shows about 13 needles
   and the three surface-conformity images show 7, 5 and 6; those four images are **not used**.
   **Confirmed by the project owner:** nine needles, 3 × 3 — keep exactly as shown.
2. **Needle length.** The sheet prints “Microneedle Length 1.0 mm”, while the brief mentions a proposed 1.5 mm design depth.
   The interface therefore states **no** needle length or depth. Layer thicknesses (support ring 4.0 mm, elastomeric ring
   3.2 mm, base plate 3.0 mm) appear once, tagged “per reference drawing, conceptual”.
   **Confirmed by the project owner:** the interface does not state a needle length.
3. **Layer names.** The brief’s names are used as titles (Structural Support Layer, Flexible TPU / Silicone Layer, Needle
   Contact Layer) with the sheet’s names as subtitles (Rigid Support Ring, Flexible Elastomeric Ring, Microneedle Base Plate).
4. **Cartridge geometry.** In the first reference set the main renders show a vial with a crimp cap, while the workflow
   frames show a capsule with purple end caps. The project owner reported the two workflow frames as wrong
   (11 November 2026) and supplied the cartridge sheet; the “Four views of the cartridge” section and the walkthrough now
   use stages 1–4 of that sheet, and the workflow frames are no longer in the project.
5. **Dose window.** On the render it resembles a dark digital display. The concept is mechanical, so it is always
   described as a “mechanical dose counter window”.
6. **Holder scale.** The holder shows a printed 0.5–3.0 mL scale while the cartridge is labelled 1.0 mL. The interface
   never quotes scale numbers.
7. **Packaging wording.** The render prints “Rx Only”, “For Professional Use Only”, marketing lines and “4 cartridges
   1.0 mL each”. It is captioned as a concept render with illustrative wording.
8. **Colour of the mixed solution.** The cartridge sheet shows the solution **blue** after mixing; the pen window in the
   earlier renders is clear (neutralised, see above). Each is shown as its source shows it, and the Product page says
   that the blue is how the sheet depicts the mixed solution. *Open question for the owner: unify, and in which direction?*
9. **Collar print on the sheet.** Stage 4 prints “TWISY TO MIX”. Corrected to “TWIST TO MIX” (see retouches).
10. **Stage 5 of the sheet is not used.** It shows the pen being assembled, with “0.5 **mg**” in the dose window — the unit
    that was already corrected to mL on the pen render. The assembled pen is shown from the original pen render instead.

## Sign-in illustrations (`src/assets/illustrations/`)

`login-patient.webp` (a patient at home, checking a plan on a phone) and `login-physician.webp` (a physician reviewing a
plan on a tablet) appear on the two sign-in pages, in both languages. They are **AI-generated illustrations**, drawn flat
in the site palette. They depict no real person and no product, carry no text, and can be replaced by commissioned artwork
without touching the layout (same 3 : 4 frame, one import in `src/assets/index.ts`).

## Original illustrations

- `ConformArc` (concave / flat / convex) is an original schematic drawn in SVG to replace the rejected conformity renders.
  It illustrates intent only and is captioned as not validated.
- Contour-line backgrounds, the nine-dot glyph and article cover art are original vector work.

## Synthetic progress photos (`public/demo/`)

The fifteen “scalp” images are **procedurally generated** (`tools/asset-pipeline/scalp.py`): noise-based skin, a drawn hair
flow field and a bare patch whose fine-hair density varies between dates. They depict no real person, are labelled
“Synthetic image” in the interface, and imply no treatment effect — the variation exists only to make the timeline and
comparison screens demonstrable.
