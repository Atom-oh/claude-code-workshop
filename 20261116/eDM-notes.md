# November 16–17, 2026 FSI Workshop Invitation

## Files

- `eDM.html`: web invitation following the original workshop eDM layout, with
  chapter timelines, lab links, QR cards, and a persistent light/dark toggle.
- `eDM.txt`: subject, preview text, and plain-text body.
- `fsi-edm.html`: compatibility entry forwarding to `eDM.html`, preserving
  query strings and section fragments when JavaScript is available.
- `index.html`: lab portal. Publish it with the adjacent labs and `image/` assets.

## Design Reference

Reference: `https://whchoi98.github.io/ccw-hands-on-lab/eDM.html`, inspected on
2026-09-15. Reuse its centered 940px layout, palette, typography, session cards,
and local copies of its AWS/Claude marks. NanumSquare loads from the same CDN.
Retain November dates, venue, agenda, missions, Slack/survey destinations, and
existing QR images. Reference-event speakers, model versions, Wi-Fi credentials,
and other event-specific details are not November event data.

## Event Details and Provenance

The invitation identifies November 16–17, 2026, Centerfield floor 18, rooms
300/301/400/401, and financial-services customers as the audience.

The 10:00–18:00 schedule and detailed agenda came from `labs/fsi-edm.html` in the
original import archive (`labs.zip`). Those hours were not independently
confirmed by the organizer. If they change, update the email HTML, text, and web
invitation together. The email groups some consecutive sessions.

The portal distinguishes six regular elective missions from the self-directed
Playbook Foundry mission; Chapter 6 Agent SDK is also self-directed. Imported
pages contained inconsistent model versions, so the new invitation does not
claim a single confirmed model version.

## Use and Validation Limits

Open `eDM.html` or the compatibility URL `fsi-edm.html` in a browser. The HTML
is a web page, not an email-client template. For email, use `eDM.txt` and share
the published web invitation URL. Recipient settings and subscription-management
text belong in the sending tool.

Registration URL, contact details, deadline, and per-session room assignments were not
provided. The invitation button opens the source lab Q&A Slack channel; it is
not registration. Slack and survey URLs retain their imported values; event
access and survey suitability have not been verified.

Labs were imported from the archive. In the November copy of Capstone 3, the
import removed one missing local webfont stylesheet and two browser-extension
references. The portal also received a small-screen wrapping correction. This
import did not validate lab commands, model versions, or cloud deployments.
The import archive is provenance, not a required tracked build dependency.
