# Security and privacy notes

**This prototype has no real security.** It is a front-end demonstration; treat everything below the first heading as a
description of what is simulated, and the second as what a real system would need.

## What the prototype does

| Area | Reality in this build |
|---|---|
| Authentication | Simulated. Demo credentials ship in the JavaScript bundle and are compared in the browser. No hashing, no server. |
| Session | A JSON object in `sessionStorage` (per tab, 8-hour expiry). Anyone with devtools can forge it. |
| Authorisation | Route guards (`RequireRole`) plus role checks inside each store action. Client-side only — a courtesy, not a control. |
| Data | One JSON document in `localStorage` (`dermiq.db`). Unencrypted, readable by any script on the same origin. |
| Photos | Downscaled in the browser and stored as data URLs in the same document. Never uploaded anywhere. |
| Network | No runtime requests. Fonts, icons and images are bundled. No analytics, cookies or trackers. |
| Contact form | Stored locally; nothing is sent. |
| Notifications | In-app only. No SMS, email or push. |
| Audit trail | Plan revisions and article history are recorded, but they are editable local data, not an audit log. |

Consequences: **do not enter real names, real clinical information or real photographs.** The interface repeats this where
photos are added. “Reset demo data” clears everything the prototype stored.

Things done properly even here: no `dangerouslySetInnerHTML` — user text is always rendered as text; photo uploads are
restricted to an allow-list of image types and re-encoded through a canvas (which drops metadata such as EXIF location);
storage failures are caught and reported to the user; the application contains no external links or third-party embeds.

## What a production system would require

1. **Identity** — server-side authentication, MFA for clinicians, short-lived tokens in `HttpOnly` cookies, account
   recovery, device/session management.
2. **Authorisation** — role- and relationship-based access enforced on the server (a physician sees only their patients);
   every rule now in `services/db.ts` re-implemented there.
3. **Plan integrity** — approvals and locks as append-only, signed records with actor, time and reason; the “digital lock”
   enforced by the server, not by disabling inputs.
4. **Audit** — immutable log of every read and write of clinical data.
5. **Data protection** — encryption in transit and at rest; photos in private object storage with expiring URLs; retention
   and deletion policies; data residency as required.
6. **Privacy law** — in Saudi Arabia, the Personal Data Protection Law (PDPL) and health-sector rules: lawful basis,
   explicit consent for health data and images, privacy notice, data-subject rights, breach notification.
7. **Regulatory** — software that supports treatment may itself be a medical device; classification and quality-system
   obligations (for example SFDA requirements, IEC 62304, ISO 14971, ISO 13485) must be assessed before development.
8. **Application security** — CSP and security headers, dependency scanning, rate limiting, input validation on the
   server, penetration testing, secure upload scanning.
9. **Operations** — backups, monitoring, incident response, access reviews.

## Dependencies

Runtime: `react`, `react-dom`, `react-router-dom`, `zustand`, `lucide-react`, and `@fontsource` font packages. Nothing else
runs in the browser.
