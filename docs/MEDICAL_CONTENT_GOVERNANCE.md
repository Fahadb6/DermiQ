# Medical content governance

DermiQ is a concept. The prototype is written so that nothing in it can be mistaken for a clinical claim, a dosing
recommendation or a validated instruction for use. This document records the rules the interface follows.

## 1. What the product never says

| Never | Instead |
|---|---|
| That DermiQ treats, cures, improves or regrows anything | “A concept for a physician-led treatment experience” |
| Efficacy, safety, pain or comfort claims; percentages; before/after promises | Nothing — there is no data |
| A recommended, typical, starting or maximum dose | “The value your physician set for your plan” |
| Needle length or penetration depth as a specification | Layer thicknesses only, tagged “per reference drawing, conceptual” |
| That the pen is smart, connected, tracked or verified | “The pen is mechanical and reports nothing” |
| That a session was “completed” or “delivered” | “Reported by the patient” |
| That a photo shows improvement | “A visual record — not a measurement, a diagnosis or proof of effectiveness” |
| Instructions for preparing or injecting medication | An educational walkthrough that defers to the physician’s instructions |

## 2. Who decides what

| Action | Physician | Patient | Platform |
|---|---|---|---|
| Sets the dose, interval and dates | ✔ | — | — |
| Approves and digitally locks the plan | ✔ | — | — |
| Views the approved plan | ✔ | ✔ (read-only) | — |
| Reports a session | — | ✔ | — |
| Reviews reports and photos | ✔ | — | — |
| Stores and displays the record | — | — | ✔ |
| Recommends, calculates, validates, detects or analyses | — | — | **Never** |

The dose selector offers discrete illustrative values (0.1–0.5 mL) labelled “illustrative prototype value”. They are
interface placeholders, not a dosing range, and the platform performs no check on the value chosen.

## 3. Standing disclaimers

- Site-wide strip and footer: concept prototype, fictional demo data, not an approved medical device.
- Patient app: “All people, clinics and records shown are fictional”; mechanical-pen notice on Home; reminders are in-app only.
- Physician portal: “Prototype · Demo data” in the top bar; “The platform does not suggest, calculate or validate a dose”
  on the configuration screen; the digital-lock scope note wherever the lock appears.
- Product pages: “conceptual” captions; open development questions (formulation, mixing ratio, stability, sterility,
  compatibility) are listed as **not established**.
- Packaging render: wording printed on the pack (“Rx Only” and similar) is illustrative.

## 4. Education Center workflow

```
draft → pending_review → approved → published → archived
```

- An article is visible to readers only when `published`.
- Each transition requires a note and is recorded with reviewer, date, from-state and to-state.
- Every article page shows author, medical reviewer and review date; unreviewed content says so.
- In this prototype the authors, reviewers and reviews are **fictional**. Sample articles were written for demonstration
  and have **not** been reviewed by a clinician.

Editorial rules for articles: plain language; no dosing; no outcome promises; “ask your physician” for anything individual;
each article ends by pointing back to the treating physician.

## 5. Assumption to confirm

The sample education content names **alopecia areata** as the condition the concept addresses. This framing was inferred
from the brief and is used in sample content only; it must be confirmed, corrected or removed by a qualified clinician.

The Product page describes the cartridge contents as stated in the concept (a powder medication chamber and a clear
diluent chamber) and lists formulation, mixing ratio, stability, sterility and compatibility as **not established**.
Nothing in the interface tells anyone how to prepare or administer a medication.

## 6. Before any real-world use

Clinical review of all content by licensed dermatologists; regulatory classification of both the device and the software
(in Saudi Arabia, SFDA); instructions for use written and validated through the proper process; pharmacovigilance and
complaint handling; and legal review of every claim. None of this has been done — this is a design prototype.
