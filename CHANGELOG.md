# Changelog

Release entries describe the repository at that release. See [README.md](README.md)
for the current layout. English is the maintenance documentation language.

## [Unreleased]

### Added

- Add `20261116/reactive/`, interactive HTML slide decks for the six November chapters (Remarp sources `*.md` and built `*.html`, a table of contents and a combined `index.html`). The Pages workflow publishes them at `/20261116/reactive/` and `/reactive/`.
- Add `workshop-v2/`, a draft redesigned two-day workshop for team review: shared core labs, role tracks (compliance, development, operations), Day 2 skills and governance labs, a pre-flight check, question clinic cards from the pre-survey, a facilitator guide, an invitation draft, and seed projects. Each lab page lists what was run and what was not. The Pages workflow publishes it at `/workshop-v2/` for team review.
- Add `20261123/eDM.html`, a one-day Hanwha Financial workshop invitation modeled on an existing one-day invitation, with the training agenda, the supplied Hanwha logo (margins trimmed) under `20261123/image/`, and no lecture-material links. Date and venue are marked as to be announced. The Pages workflow now publishes it at `/20261123/eDM.html`.
- Add the July chapter PDF edition under `20260703/` and architecture/cost references under `tech_doc/`.
- Add the general HTML lab portal, chapter labs, capstones, setup, preflight, and reference pages under `ccw-hands-on-lab/`.
- Add a shared light/dark theme for the general lab site.
- Add the 2026-09-05 chapter PDF edition under `20260905/` (revised against Claude Code v2.1.261) and the session-ordered `20260901/` delivery build.
- Add a ZIP download button to every general lab page toolbar; the Pages workflow now builds the offline archive.
- Add the November 16–17, 2026 event materials under `20261116/`, including labs, invitation variants, brochure, and images.
- Add the GitHub Pages workflow: publish general labs at the site root and November materials at `/20261116/`.
- Add shared `AGENTS.md` instructions, architecture and PR review guidance, and ADR-0001 documenting their scope.

### Changed

- Retime November Day 1: Ch1 10:10–10:40, break, Ch2 10:50–11:40, lunch 11:40–13:00, one combined Preflight + Ch1 + Ch2 lab 13:00–14:00, Ch3 lecture 14:00–14:40 and lab 14:40–15:40; Capstone Round 1 and Day 2 are unchanged. Updated `eDM.html`, `eDM.txt`, `eDM-notes.md`, the Ch1 deck agenda, timeline, lab slide and spoken notes, the Ch2 deck agenda notes and closing slide, the intro video's Day 1 timeline, and the Ch1 deck PDF (p2 and p26 lab time, p25 two-day timeline, and the six-chapter numbering on p5, p23, p24 and p30).
- Make the November 16–17 event the site's main page: the Pages workflow now also copies `20261116/` over the site root, so `/` serves the November portal and `/eDM.html` the November invitation. Same-named general lab pages at the root are replaced by their November versions; `assets/`, `v1/`, `START_HERE.txt` and the offline ZIP (still built from `ccw-hands-on-lab/`) are unchanged, and `/20261116/` keeps working.
- Apply the second deck review to the November chapter PDFs (re-exported from PowerPoint with embedded NanumSquare): data-location wording for the global inference profile, Ch2 IAM `ListInferenceProfiles` statement and 5.5 `modelOverrides` keys, Ch3 classifier model, DLP hook fail-closed with `onFailure`, sandbox and MCP lock keys, Guardrail IAM enforcement, Ch4 `code-reviewer` and `--agent`/`--tools` CI example, Ch5 plugin CLAUDE.md and marketplace allowlist, Ch6 exit-code-preserving output filter, gateway cache TTL and idle compaction conditions.
- Fix Ch1–Ch3 labs that a Claude Code 2.1.319 rerun showed were wrong: Ch3 TASK 03 now reads the classifier model from the debug log (`CLAUDE_CODE_AUTO_MODE_MODEL` with Sonnet 5.5 is ignored); Ch3 TASK 02 blocks on grep errors and adds `onFailure: "block"`; Ch3 TASK 04 adds `allowManagedDomainsOnly`, `allowUnsandboxedCommands: false` and `failIfUnavailable` (without them auto mode widened the list and reached example.com); Ch2 TASK 01 moves `bedrock:ListInferenceProfiles` to its own `"Resource": "*"` statement; Ch1 TASK 04 explains that the global profile can process outside the calling region.
- Regenerate the November chapter PDFs after a full deck review: match the lab slides to the lab guides (Ch2 policy example and TASK order, Ch3 restore step, Ch4 code-reviewer and `@` typeahead instead of `/agents`, Ch5 Super Lab TASK 01–06), align session times with the retimed agenda (Ch1 lab at 11:20, Ch2 lab 50 minutes, Ch6 Part 1 at 12:40 for 60 minutes), unify Claude Apps Gateway naming, and fix the Slack channel name on closing slides.
- Replace the November chapter labs with the redesigned six-chapter course on Amazon Bedrock (Preflight; Ch1 how it works; Ch2 Bedrock deployment and policy delivery; Ch3 guardrails and DLP; Ch4 subagents; Ch5 plugins and mods; Ch6 tokens and cost). The labs keep their published filenames so existing invitation links still resolve, and reflect the 2026-11-06 and 2026-11-08 rehearsals on Claude Code 2.1.318–2.1.319. The previous Ch6 Agent SDK lab moves to `ClaudeCode_AgentSDK_HandsOnLab.html` as a self-paced lab. Preflight screenshots move to `20261116/images/guides/preflight/`.
- Add the November chapter decks as PDFs under `20261116/slides/` and link each chapter session in `eDM.html` and the portal to its PDF.
- Update `eDM.html`, `eDM.txt`, and the portal to the redesigned agenda, `us-east-1`, and the code-server plus Claude Apps Gateway environment. Capstone and reference pages are unchanged.
- Regenerate the November chapter PDFs from the final decks (survey-driven slides, Claude Code architecture map, Bedrock built-in tool limits) and rewrite the `eDM.html` and `eDM.txt` session descriptions to match the decks and labs with unchanged times: Ch1 links its self-paced lab, Ch6 Part 1 and Part 2 link lab TASK 01–04 and 05–07, and the environment section states the Amazon Bedrock path only. Fix the Preflight troubleshooting row to name the `IDEUrl` output. Ignore `*.pptx` and `*.potx` so editable decks stay out of the repository.

- Use the requested sonnet-5.5 and opus-5.5 names in the November Capstones 1-6 and switch the Bedrock model IDs to the Sonnet 5.5 inference profiles (`global.anthropic.claude-sonnet-5-5` for Capstones 2, 4, 5, 6 and Ch6, `us.` for Ch1).
- Update the November labs against the Claude Code 2.1.296 documentation and CLI: Ch2 subagent frontmatter, model resolution, background and concurrency defaults, and built-in agents; Ch3 managed controls, Bedrock IAM policy and MCP lockdown; Ch4 hook scope; Ch5 and Ch6 tool-restriction semantics (`--tools` and SDK `tools` restrict, `--allowed-tools` and `allowedTools` only auto-approve); Ch1 install and Bedrock model pinning; Reference 1 directory map and settings precedence; Reference 2 command rows; Reference 3 plugin CLI.
- Refresh the November labs for Claude Code v2.1.296: add a mods section and a financial-services plugin/mod governance section to Reference 3, add a permission-mode callout (auto mode is the default start mode since v2.1.283) to Ch4, and update the Ch1 sample output version.
- Re-theme the November Ch1/Ch2 sample project from a user service to an account service with a missing KYC grade, and the Ch6 notes agent to fictional internal-control policy notes; replace the Capstone 7 domain examples with financial-services domains.
- Rebuild `ccw-hands-on-lab/` from the 2026-09-19 reader build with a shared `assets/` directory; move the previous build, including legacy capstones A–D, to `ccw-hands-on-lab/v1/`.
- Add Capstones 4–6 (Trend Radar, Quake Watch, Newsroom Lens) and live result-sample links to the general labs.
- Align the November web invitation with the original workshop eDM design, retain November event details, and route the legacy invitation URL to the same page.
- Move the original chapter PDFs into `20260525/` and separate supplementary PDFs from chapter editions.
- Align project documentation with both static sites and the actual Pages workflow.
- Make `CLAUDE.md` import `AGENTS.md` to avoid duplicate policies.
- Use concise English for maintenance documentation while preserving Korean teaching material and English release history.
- Distinguish accepted decisions, current behavior, archived examples, and historical release records in review guidance.

### Fixed

- Correct statements the current documentation contradicts: `Write(**)` permission rules are never evaluated, `/review` is an alias of `/code-review` since v2.1.223, SDK `settingSources` defaults to all sources, `--bare` requires an API key, and subscription defaults to Opus 5.5.
- Correct the November Capstone 5 and 6 superpowers commands to `/superpowers:writing-plans` and `/superpowers:executing-plans`, matching the other capstones and Reference 3.
- Fix the Chapter 2 lab JSON post-processing to read `.result` from the `--output-format json` envelope, and the same fabricated structure in the snippet archive (slides 56, 79, 179, 195).
- Correct code-panel contrast in the general site's light theme and keep its theme toggle visible inside the content column.

## [1.0.1] - 2026-05-27

### Changed

- Move the six chapter PDFs from `PDF/` to the project root so they can be opened directly without descending into a subdirectory.
- Update `README.md` paths, project structure tree, and usage examples to reflect the new PDF location.

### Removed

- Remove the now-empty `PDF/` directory from the repository.

## [1.0.0] - 2026-05-25

### Added

- Publish the initial Claude Code Deep Dive Workshop release as a PDF-centric distribution of the three-day, 850-slide curriculum.
- Distribute Chapter 1 (Overview, 200 slides) as `PDF/ClaudeCode_Ch1_20260525.pdf`.
- Distribute Chapter 2 (Agents & Subagents, 110 slides) as `PDF/ClaudeCode_Ch2_20260525.pdf`.
- Distribute Chapter 3 (Admin Setup, 120 slides) as `PDF/ClaudeCode_Ch3_20260525.pdf`.
- Distribute Chapter 4 (Settings, 140 slides) as `PDF/ClaudeCode_Ch4_20260525.pdf`.
- Distribute Chapter 5 (CLI Reference, 130 slides) as `PDF/ClaudeCode_Ch5_20260525..pdf`.
- Distribute Chapter 6 (Agent SDK, 150 slides) as `PDF/ClaudeCode_Ch6_20260525.pdf`.
- Add the extracted code snippet archive under `Script/workshop-code/`, totaling 502 markdown files across six chapter folders and 53 part folders.
- Include 108 snippets under `ch1-overview` across 10 parts covering installation, IDE integration, and CLAUDE.md authoring.
- Include 53 snippets under `ch2-agents` across 9 parts covering subagent definition, the Task tool, and five production patterns.
- Include 57 snippets under `ch3-admin` across 9 parts covering deployment, credentials, network security, governance, SSO, and audit logging.
- Include 86 snippets under `ch4-settings` across 9 parts covering `settings.json`, permissions, hooks, MCP, and custom slash commands.
- Include 86 snippets under `ch5-cli` across 8 parts covering the `claude` CLI, headless mode, output formats, and CI/CD integration.
- Include 112 snippets under `ch6-sdk` across 8 parts covering SDK basics, the Messages API, tool use, streaming, MCP integration, and production patterns.
- Provide Python and TypeScript samples side by side across the Agent SDK material.
- Cover three authentication paths in all SDK examples: Anthropic Direct, Amazon Bedrock, and Vertex AI.
- Embed a single-sentence Korean speaker note in every extracted snippet markdown file.
- Apply a consistent design system — 16:9 ratio, Black/Navy theme (`#161D26`), accent color (`#FF9900`) — across all six chapter PDFs.
- Add `Script/workshop-code-README.md` and `Script/workshop-code/README.md` as navigation guides for the snippet archive.

[Unreleased]: https://github.com/Atom-oh/claude-code-workshop/compare/99966d0...HEAD
[1.0.1]: https://github.com/whchoi98/claude-code-workshop/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/whchoi98/claude-code-workshop/releases/tag/v1.0.0
