# Repository Instructions

## Scope

This repository distributes a Korean-language Claude Code workshop: PDF decks,
Markdown examples, and static HTML lab sites. It has browser JavaScript and a
GitHub Pages workflow, but no application backend, package manager manifest,
site compilation step, or automated test suite.

| Path | Role |
| --- | --- |
| `20260525/`, `20260703/` | Chapter PDF editions; July is the latest chapter PDF edition |
| `ccw-hands-on-lab/` | General lab site, with shared `theme.css` and `theme.js` |
| `20261116/` | November event site, labs, invitation, brochure, and image assets |
| `Script/workshop-code/` | Archived slide examples and Korean speaker notes |
| `tech_doc/` | Supplementary PDFs |
| `.github/workflows/pages.yml` | Assemble and deploy the two HTML sites |
| `docs/` | Architecture, review procedure, and decision records |

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

- Edit HTML/CSS/JavaScript sources directly. Keep the two site directories
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
  `node --check ccw-hands-on-lab/theme.js` when changing that script.
- No `npm test` or application build exists here; deployment is limited to
  Pages. Workshop commands may require separate learner environments; do not
  run them as repository checks.
- Follow [docs/review.md](docs/review.md) for review evidence, severity, context
  delivery, and the latest-HEAD merge gate. Missing or failed review coverage
  is not approval.
