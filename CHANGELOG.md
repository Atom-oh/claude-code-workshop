# Changelog

Release entries describe the repository at that release. See [README.md](README.md)
for the current layout. English is the maintenance documentation language.

## [Unreleased]

### Added

- Add `workshop-v2/`, a draft redesigned two-day workshop for team review: shared core labs, role tracks (compliance, development, operations), Day 2 skills and governance labs, a pre-flight check, question clinic cards from the pre-survey, a facilitator guide, an invitation draft, and seed projects. Each lab page lists what was run and what was not. It is not added to the Pages workflow.
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
