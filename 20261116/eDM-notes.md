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
and Claude mark. The dark header uses the supplied white AWS for Financial
Services logo. NanumSquare loads from the same CDN.
Use November dates, venue, agenda, missions, and current event channels.
When the Slack channel changes, update `eDM.html`, `eDM.txt`, and
`image/SlackQR.png` together and verify the decoded QR destination.
Reference-event speakers, model versions, Wi-Fi credentials, and other
event-specific details are not November event data.

## Event Details and Provenance

The invitation identifies November 16–17, 2026, Centerfield floor 18, rooms
300/301/400/401, and financial-services customers as the audience.

The 10:00–18:00 schedule and detailed agenda came from `labs/fsi-edm.html` in the
original import archive (`labs.zip`). Those hours were not independently
confirmed by the organizer. If they change, update `eDM.html` and `eDM.txt`
together. The plain-text email groups some consecutive sessions.

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
not registration. The Slack URL was supplied for this event; the survey URL
retains its imported value. Channel membership and survey suitability have not
been verified.

The chapter labs were replaced on 2026-11-08 with the redesigned six-chapter
course, generated from the Korean lab sources of the November lab environment
repository and checked against two rehearsal events. They keep the previous
filenames (`ClaudeCode_Preflight_Check.html`, `ClaudeCode_Ch1_HandsOnLab.html` to
`ClaudeCode_Ch6_HandsOnLab.html`); the previous Ch6 Agent SDK lab is now
`ClaudeCode_AgentSDK_HandsOnLab.html`.

On 2026-11-08 the session descriptions in `eDM.html` and `eDM.txt` were
rewritten from the final decks and labs. Session times are unchanged; the
instructors fit deck and lab content to each slot. Lab lengths on the portal
(`index.html`) are the full lab guide lengths, not session lengths. Mapping:

- Ch1 (10:10–10:40) is lecture only. Its 20-minute lab is linked from the
  session card and listed as self-paced in `eDM.txt`.
- Ch2 lab (13:00–13:40) runs TASK 00–06, ending with the Apps Gateway
  group-policy check.
- Ch3 (13:40–14:30) covers the DLP hook and fail-open tasks in session; the
  auto mode task is an optional lab.
- Ch6 Part 1 (13:00–13:40) runs lab TASK 01–04. Part 2 (16:50–17:40) runs
  TASK 05–07 as a participant lab (gateway login, group policy, spend limit).

Capstone and reference labs were imported from the archive. In the November copy of Capstone 3, the
import removed one missing local webfont stylesheet and two browser-extension
references. The portal also received a small-screen wrapping correction. This
import did not validate lab commands, model versions, or cloud deployments.
The import archive is provenance, not a required tracked build dependency.

## Intro Video

`eDM.html` shows a 93-second intro video above the workshop introduction. It
does not autoplay and has Korean captions (`media/intro-90s.ko.vtt`, on by
default). `media/intro-90s.mp4` (H.264/AAC, 1920×1080, ~5 MB, faststart) and
`media/intro-poster.jpg` (1280×720, the title frame) are web re-encodes of a
Remotion render from a local project outside this repository
(`fsi-workshop-video/`, a sibling of this repository's checkout). The file
keeps its original `intro-90s.mp4` name so existing links still work.

The scenes use only facts from `eDM.txt` and the reactive decks; the preview
scene shows Ch1 slides 7 and 16 captured from the published
`/20261116/reactive/` deck. Narration is Amazon Polly (ko-KR Seoyeon,
generative), one line per scene, from `narration/script.json`
(`narration/generate.sh`). The BGM is a sine-tone pad generated by
`narration/bgm.sh` with ffmpeg; it uses no samples or third-party audio, so no
music license applies. The first published version (2026-11-08, about 90
seconds) came from a different local project.

When the intro changes, run `npm run narration`, `npm run bgm` (only if the
length changes) and `npm run render` in `fsi-workshop-video/`, then run these
from this repository's `20261116/` folder, and regenerate the caption cues
from `src/vo-manifest.json` and the scene lengths:

```
ffmpeg -i ../../fsi-workshop-video/out/fsi-workshop-intro.mp4 -c:v libx264 \
  -preset slow -crf 27 -pix_fmt yuv420p -c:a aac -b:a 128k \
  -movflags +faststart media/intro-90s.mp4
ffmpeg -ss 3.8 -i media/intro-90s.mp4 -frames:v 1 -vf scale=1280:720 \
  -q:v 4 media/intro-poster.jpg
```
