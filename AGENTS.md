# Repository Instructions

## Scope

This repository distributes a Korean-language Claude Code workshop: PDF decks,
Markdown examples, and static HTML lab sites. It has browser JavaScript and a
GitHub Pages workflow, but no application backend, package manager manifest,
site compilation step, or automated test suite.

| Path | Role |
| --- | --- |
| `20260525/`, `20260703/`, `20260901/`, `20260905/` | Chapter PDF editions; `20260905/` is the latest, `20260901/` is a session-ordered delivery build |
| `ccw-hands-on-lab/` | General lab site (reader build) with shared `assets/`; `v1/` archives the previous build |
| `20261116/` | November event site, labs, invitation, brochure, and image assets |
| `workshop-v2/` | Draft redesigned two-day workshop (shared core, role tracks, seed projects) for team review; published at `/workshop-v2/` |
| `20261123/` | One-day Hanwha Financial workshop invitation (`eDM.html`) and its logo, published at `/20261123/eDM.html` |
| `tools/mydata/` | Synthetic MyData generator, validator, kit builder, and November lab guard; not published |
| `Script/workshop-code/` | Archived slide examples and Korean speaker notes |
| `tech_doc/` | Supplementary PDFs |
| `.github/workflows/pages.yml` | Assemble and deploy the published HTML directories |
| `docs/` | Architecture, review procedure, and decision records |

## November Event Chapters (`20261116/`)

The November event uses six chapters (renumbered 2026-11-09, PR #20). Use
these numbers and titles in every deck, lab, portal, invitation, and video
change; old numbers in learner folders are legacy.

| Ch | Title | Former content | Lab page(s) | Reactive deck |
| --- | --- | --- | --- | --- |
| 1 | Claude Code는 어떻게 동작하는가 | Ch1 | `ClaudeCode_Ch1_HandsOnLab.html` | `01-ch1-how-it-works` |
| 2 | Bedrock 위에서 안전하게 쓰기 | Ch2 + Ch3 (one 50-min lecture) | Lab 1 `ClaudeCode_Ch2_HandsOnLab.html`, Lab 2 `ClaudeCode_Ch2_Guardrails_HandsOnLab.html` | `02-ch2-bedrock-safe` |
| 3 | Subagent로 일 나눠 맡기기 | Ch4 | `ClaudeCode_Ch3_HandsOnLab.html` | `03-ch3-subagents` |
| 4 | Claude Code 확장하기 | Ch5 | `ClaudeCode_Ch4_HandsOnLab.html` | `04-ch4-extending` |
| 5 | 비용 효율적으로 쓰기 | Ch6 Part 1 | `ClaudeCode_Ch5_HandsOnLab.html` (TASK 00-04) | `05-ch5-cost-efficient` |
| 6 | 조직의 비용 보고 통제하기 | Ch6 Part 2 | `ClaudeCode_Ch6_HandsOnLab.html` (TASK 00-04) | `06-ch6-org-cost` |

- Session times live in `20261116/eDM.html`; change them together with
  `eDM.txt`, `eDM-notes.md`, the intro video, `reactive/toc.html` (card times,
  plus its titles, taglines and slide counts after a deck change), and every deck slide that
  states a time (Ch1 timeline, opening and agenda slides, takeaways, and
  closing `@message`, `@next-label`, and notes). Grep
  `20261116/reactive/*.md` for `HH:MM` to find them.
- `slides/ClaudeCode_FSI_Ch1..6_20261116.pdf` follow the six-chapter numbering.
  They are image-only exports of the reactive decks (one screenshot per slide),
  so re-export them after a deck change; learner folders such as
  `~/claude-lab/ch4` keep old names.
- Reactive decks are Remarp sources in `20261116/reactive/*.md`; rebuild the
  HTML with the reactive-presentation compiler instead of editing it, then
  strip trailing whitespace from the generated HTML before committing. The
  build also writes `reactive/toc.html`; that page is hand-maintained (Korean
  chapter cards linking slides, previews, labs and PDFs), so restore it after a
  build (`git checkout -- 20261116/reactive/toc.html`) and edit it directly.
- The Agent SDK lab is a self-paced "SDK" track, not a chapter.
- Every November page (eDM, portal, labs, capstones, references, reactive
  decks) opens dark. Light is the projector mode, for rooms where dark slides
  wash out: one shared `localStorage` key, `fsi-theme`, or `?theme=light` on
  any URL switches every page. Keep light text at 7:1 or more, accent text at
  4.5:1 or more, and borders near 3:1; check new light colours against that.

## Documentation

- Maintain project instructions, root README/CHANGELOG, ADRs, and operational
  notes in concise English only. Do not add bilingual copies or language badges.
- Korean learner content in PDFs, HTML, invitation text, and the `Script/`
  archive is intentional. Translate it only when requested.
- This file is the canonical repository instruction source. `CLAUDE.md` imports
  it; do not maintain a second copy of these rules.
- Read [architecture](docs/architecture.md) for current structure and
  [review guidance](docs/review.md) for PR work. Read ADRs only when relevant.
- Accepted ADRs describe scoped decisions. Proposed or superseded decisions,
  changelog releases, and example instructions are not current mandates.
  If a decision and implementation disagree, identify the discrepancy and
  resolve it explicitly; existing behavior alone does not prove correctness.
- Do not import another project's AWS infrastructure, bilingual documentation,
  framework, or test requirements just because a workshop example mentions them.

## Editing

- Edit HTML/CSS/JavaScript sources directly. Keep the site directories
  independent; shared filenames do not imply synchronized content or themes.
- PDFs are rendered artifacts. Replace them with regenerated source exports
  when requested; do not patch binary contents. Deck sources live elsewhere.
- Keep snippet filenames `NNN-slug.md` stable (`NNN` is the source slide number).
  Cite source slides in commit bodies when changing examples. The archive is
  educational material, not the site's executable backend.
- Preserve existing attribution, license terms, resource URLs, and archived
  filenames unless the task calls for a verified correction. Use neutral
  wording for new project descriptions; official names in teaching material
  and existing event assets are not prohibited. Do not add internal-only
  organizational or confidentiality labels to public documents.
- Use Conventional Commits. Leave unrelated local files, including imported
  archives, untouched.

## Validation and Review

- Run `git diff --check`. Check changed documentation links and factual claims
  against tracked files and history.
- For site changes, check local links/assets and preview the affected pages at
  the published paths. Test changed browser behavior; use
  `node --check ccw-hands-on-lab/assets/theme.js` when changing that script.
- When changing November lab pages or `tools/mydata/`, run `python3 -m unittest discover -s tools/mydata/tests -t .` and `python3 tools/mydata/build.py --version <v> && python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip`.
- No `npm test` or application build exists here; deployment is limited to
  Pages. Workshop commands may require separate learner environments; do not
  run them as repository checks.
- Follow [docs/review.md](docs/review.md) for review evidence, severity, context
  delivery, and the latest-HEAD merge gate. Missing or failed review coverage
  is not approval.
