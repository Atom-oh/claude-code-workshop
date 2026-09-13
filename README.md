# Claude Code Deep Dive Workshop

A Korean-language workshop distributed as chapter PDFs, searchable code
examples, and static HTML labs. Project maintenance documentation is English.

## Materials

| Location | Contents |
| --- | --- |
| [20260525](20260525/) | Original six-chapter PDF edition |
| [20260703](20260703/) | July six-chapter PDF edition, authored against Claude Code 2.1.198 |
| [General labs](ccw-hands-on-lab/index.html) | Chapter labs, capstones, setup, preflight, and reference pages |
| [November event](20261116/index.html) | Materials for the November 16–17, 2026 workshop |
| [Code archive](Script/workshop-code/README.md) | 502 numbered slide examples organized by chapter and part |
| [Technical documents](tech_doc/) | Architecture and cost-efficiency PDFs |

The six chapters cover Overview, Agents & Subagents, Admin Setup, Settings,
CLI Reference, and Agent SDK. July is the latest **chapter PDF edition**;
the November directory contains event materials and HTML labs.

## Use

Open PDFs with a PDF viewer and Markdown with a text editor or GitHub. Browse
the HTML entry points in a browser. To serve both source sites locally:

```bash
git clone git@github.com:Atom-oh/claude-code-workshop.git
cd claude-code-workshop
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/ccw-hands-on-lab/` or
`http://127.0.0.1:8000/20261116/`. Python is only needed for this optional
preview server. The repository has no package installation or compilation step.
Lab exercises describe tools and services to run in a separate learner environment.

```bash
# Search the teaching archive.
rg -n 'PreToolUse|tenacity' Script/workshop-code/
rg --files Script/workshop-code/ | rg auth
```

## Publishing

[The Pages workflow](.github/workflows/pages.yml) copies the general lab site
to the deployed site root and November materials to `/20261116/`. It runs for
matching pushes to `main` or a manual dispatch. Use the workflow's deployment
URL for this repository; links to the original author's sites in course
materials are external references.

The workflow publishes static files. It does not execute workshop commands,
build an application, publish chapter PDFs, or run PR reviews.
See [architecture and preview instructions](docs/architecture.md).

## Contributing

Read [AGENTS.md](AGENTS.md) and the [PR review procedure](docs/review.md).
Use a branch and Conventional Commits. Cite source slide numbers when editing
archived examples. Validate the changed files and include the results in the PR.

[Decision records](docs/decisions/README.md) explain repository conventions.
[CHANGELOG.md](CHANGELOG.md) records history; released paths and versions describe
their release, not the current layout.

## License

This project is distributed under **Proprietary** terms. Internal use, private
delivery to customers, and modification for internal training are permitted;
external redistribution and commercial resale are prohibited.

## Attribution

Original workshop maintainer: **Choi WooHyung**, Principal Solutions Architect.
Email: whchoi@amazon.com. For this checkout, use the issue tracker of the
repository hosting it.
