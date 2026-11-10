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

The portal lists the chapter labs, the new Round 1 and Round 2 capstone
missions, the self-paced Agent SDK lab (labeled "SDK", not a chapter), and the
reference pages. The old Capstone 1-7 missions (including Playbook Foundry)
remain only as an archive of earlier examples. Imported pages contained
inconsistent model versions, so the new invitation does not claim a single
confirmed model version.

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
rewritten from the final decks and labs. Lab lengths on the portal
(`index.html`) are the full lab guide lengths, not session lengths.

On 2026-11-09 the course was renumbered and the Day 1 timetable changed. Old
Ch2 and Ch3 merged into Ch2, old Ch4 and Ch5 became Ch3 and Ch4, and old Ch6
was split into Ch5 (Part 1, context engineering) and Ch6 (Part 2, organization
cost). Lab files after the renumbering:

| Chapter | Lab file | Slides PDF |
| --- | --- | --- |
| Ch1 | `ClaudeCode_Ch1_HandsOnLab.html` | Ch1 |
| Ch2 Lab 1 (policy) | `ClaudeCode_Ch2_HandsOnLab.html` | Ch2 |
| Ch2 Lab 2 (guardrails and DLP, old Ch3 lab) | `ClaudeCode_Ch2_Guardrails_HandsOnLab.html` | Ch2 |
| Ch3 (subagents, old Ch4) | `ClaudeCode_Ch3_HandsOnLab.html` | Ch3 |
| Ch4 (extending, old Ch5) | `ClaudeCode_Ch4_HandsOnLab.html` | Ch4 |
| Ch5 (old Ch6 TASK 00–04) | `ClaudeCode_Ch5_HandsOnLab.html` | Ch5 |
| Ch6 (old Ch6 TASK 05–08, renumbered 01–04) | `ClaudeCode_Ch6_HandsOnLab.html` | Ch6 |

Since 2026-11-09 the slide PDFs follow the six-chapter numbering. Each is an
image-only export of its reactive deck (`reactive/0N-*.html`): one 1920×1080
screenshot per slide, taken with the reactive-presentation `export_pptx.py`
and assembled into a PDF, so the text is not selectable. Interactive slides
(pickers, steppers) show one state only. Re-export after a deck change:

1. Build the decks, then serve `20261116/reactive/` and hide the theme
   button (add `.fsi-theme-toggle{display:none}` to `assets/fsi.css` in the
   scratch copy only).
2. Run `export_pptx.py <dir> --blocks 0N-*.html -o 0N.pptx --scale 2` from
   the reactive-presentation skill for each deck.
3. Take each slide's image from the PPTX, downscale it to 1920×1080 and save
   the pages as one PDF (Pillow: `Image.save(..., save_all=True,
   resolution=144, quality=90)`), named `slides/ClaudeCode_FSI_ChN_20261116.pdf`.

The earlier PDFs came from separate PowerPoint decks under the old numbering.

Session mapping:

- Day 1 (retimed 2026-11-09): Ch1 lecture 10:10–10:40, break 10:40–10:50,
  Ch2 lecture 10:50–11:40 (covers the old Ch2 and Ch3 decks), lunch
  11:40–13:00, one combined lab 13:00–14:00 (Preflight, Ch1 lab, Ch2 Lab 1 and
  Lab 2), Ch3 lecture 14:00–14:40, Ch3 lab 14:40–15:40, Capstone Round 1
  15:50–17:40. The combined lab's required TASKs add up to about 110 minutes
  by the lab pages' own estimates (Preflight 7, Ch1 20, Lab 1 50, Lab 2 35),
  so facilitators choose which TASKs run in the session; the Ch2 Lab 1 and Lab 2
  restore TASKs must still run. The Ch3 deck is paced for a 17-minute lecture
  and a 40-minute lab (the lab page's required TASKs).
- Day 2 times are unchanged: Ch4 10:10–11:30, Ch5 12:40–13:40 (lab TASK
  01–04), Ch6 16:50–17:40 (lab TASK 01–03 as a participant lab: telemetry,
  gateway login and group policy, spend limit; TASK 04 is optional).

Capstone and reference labs were imported from the archive. In the November copy of Capstone 3, the
import removed one missing local webfont stylesheet and two browser-extension
references. The portal also received a small-screen wrapping correction. This
import did not validate lab commands, model versions, or cloud deployments.
The import archive is provenance, not a required tracked build dependency.

## Capstone redesign (2026-11-09)

The capstone is no longer a free-topic build that must be deployed to
CloudFront. Round 1 (Day 1, 15:50–17:40) is "my agents and guardrails": each
participant picks one data mission (R1-A customer-tailored service on MyData,
R1-B Seoul real-estate public data with a self-built MCP, R1-C an MCP of their
choice). Round 2 (Day 2, 13:40–16:40) is "publish and reuse my plugin": bundle
the R1 agents into a plugin, publish it to a marketplace, install it in a fresh
folder, then complete at least two of R2-1 (recurring analysis report), R2-2
(planning proposal), R2-3 (AgentCore app, optional). Submission in Slack is the
plugin install command, the two task results, and the scene where a guardrail
blocked something; CloudFront is not required. Times are unchanged.

New pages: `ClaudeCode_Capstone_Overview.html`,
`ClaudeCode_Capstone_R1A/R1B/R1C_HandsOnLab.html`, and
`ClaudeCode_Capstone_R2_Package/R2_1/R2_2/R2_3_HandsOnLab.html` (the eDM links
R2 missions through the Overview `#missions-r2` anchor). The old Capstone 1–7
missions stay in the repository as an archive of earlier examples ("예전 예시")
and are no longer linked from the invitation except Playbook Foundry in the
self-paced list.

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
(`narration/generate.sh`). The script respells English terms that Polly
misreads, such as 써브에이전트 and 디엘피; terms it reads correctly (Claude Code,
Bedrock) stay in English. The captions always keep the English term (Subagent,
DLP). The BGM is a sine-tone pad generated by
`narration/bgm.sh` with ffmpeg; it uses no samples or third-party audio, so no
music license applies. The first published version (2026-11-08, about 90
seconds) came from a different local project, `20261116/video/`. That folder
is listed in the root `.gitignore`; never commit it, because Pages publishes
everything under `20261116/`.

When the intro changes, run `npm run narration` and `npm run render` in
`fsi-workshop-video/`. If the video runs longer than the 95-second pad, first
regenerate it with `D=<seconds> npm run bgm`. Then run these from this
repository's `20261116/` folder and rebuild the caption cues: each scene's
cue starts 0.5 s into the scene and lasts its clip length in
`src/vo-manifest.json`; two-sentence lines are split at the spoken pause.
Cues sit at the top of the frame (`line:2%`) so they never cover on-screen
text.

```
ffmpeg -i ../../fsi-workshop-video/out/fsi-workshop-intro.mp4 -c:v libx264 \
  -preset slow -crf 27 -pix_fmt yuv420p -c:a aac -b:a 128k \
  -movflags +faststart media/intro-90s.mp4
ffmpeg -ss 3.8 -i media/intro-90s.mp4 -frames:v 1 -vf scale=1280:720 \
  -q:v 4 media/intro-poster.jpg
```

## Chapter Preview Videos

`media/chapters/chN-preview.mp4` (with a `chN-preview.jpg` poster) is the
one-minute landscape preview of chapter N. Each reactive deck shows a
"▶ 1분 미리보기" button on its cover that plays it in an in-deck player
(`reactive/assets/chapter-video.js` and `chapter-video.css`, loaded by
`assets/stepviz.js`, so no deck HTML changes). The videos are web encodes of the
`Wide-CHN` renders from the local, untracked Remotion project in `video/`
(Amazon Polly narration, synthesized BGM). Re-encode after a new render, from
this folder:

```
ffmpeg -i video/out/Wide-CH1.mp4 -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p -c:a aac -b:a 112k -movflags +faststart media/chapters/ch1-preview.mp4
ffmpeg -ss 1.5 -i media/chapters/ch1-preview.mp4 -frames:v 1 -vf scale=1280:720 \
  -q:v 4 media/chapters/ch1-preview.jpg
```
