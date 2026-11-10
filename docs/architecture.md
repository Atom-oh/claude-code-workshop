# Architecture

## Repository and Runtime

The repository contains teaching content and static browser pages published from three directories.
There is no deployed API, database, cloud application stack, or dependency
manifest. Shell, Python, TypeScript, IAM, and CI examples inside lessons belong
to the curriculum; they are not repository infrastructure.

| Source | Behavior |
| --- | --- |
| `ccw-hands-on-lab/index.html` | General lab portal; at the site root it is replaced by the November portal (see Pages Contract) |
| `ccw-hands-on-lab/assets/` | Shared reader/workshop CSS and JS, theme script, fonts, per-page legacy CSS; pages must stay beside it |
| `ccw-hands-on-lab/v1/` | Archived previous lab build, including legacy capstones A–D |
| `20261116/index.html` | November event portal with its own page styling/scripts; also the site's main page at `/` |
| `20261116/ClaudeCode_*.html` | November chapter labs, capstones, setup, and references |
| `20261116/slides/` | November chapter deck PDFs, linked from the invitation and portal; included in the Pages artifact |
| `20261116/images/guides/` | Screenshots used by the November chapter labs |
| `20261116/AWS_CCB_Program_Brochure.pdf` | Event brochure included in the Pages artifact |
| `20261116/eDM.html`, `eDM.txt` | Web invitation and plain-text email copy |
| `20261116/fsi-edm.html` | Compatibility entry forwarding to the web invitation |
| `20261116/image/` | Event image assets |
| `20261116/assets/labviz.js`, `labviz.css` | Shared lab visual-explainer component: step-through SVG figures (`<figure class="viz" data-viz>`), per-block `cmd-explain` line highlighting, and paste-target badges. Loaded by the Preflight, Ch1-Ch6 and Ch2 Guardrails labs; no network dependencies |
| `20261116/assets/aws-icons/` | Unmodified AWS Architecture Icons (07312025 set) used by the lab figures; source mapping in its `README.md` |
| `20261123/eDM.html`, `20261123/image/` | Standalone one-day invitation for Hanwha Financial with the trimmed supplied logo; copied to `/20261123/` by the Pages workflow (no `index.html`, so use `/20261123/eDM.html`) |
| `workshop-v2/` | Draft two-day workshop: HTML labs with `assets/`, runnable seed projects under `seed/`, and a facilitator guide. Copied to `/workshop-v2/` by the Pages workflow for team review; seed projects are downloadable files, not executed by Pages |
| `20260525/`, `20260703/`, `20260901/`, `20260905/`, `tech_doc/` | PDF distribution, outside the Pages artifact |
| `tools/mydata/` | Stdlib Python that generates the seeded synthetic MyData (raw and pseudonymized), validates it against `dlp_pattern.txt`, packs `mydata-kit.zip` with per-chapter checkpoints, and guards the November lab pages (`check_labs.py`). Outside the Pages artifact; `dist/` is gitignored. The kit is hosted in the Workshop Studio assets bucket of the Apps Gateway workshop and learners fetch it with `aws s3 cp`. See [tools/mydata/README.md](../tools/mydata/README.md) |
| `Script/workshop-code/` | Archived Markdown examples, outside the Pages artifact |

The November site was imported separately and is not generated from the general
site. Its seven numbered capstones and the general site's three numbered
capstones are different curricula; both also retain lettered capstone files.
Do not infer a missing file from differences between editions.

PDF deck sources are maintained outside this checkout, except
`20261116/slides/`, which is exported from the `20261116/reactive/` decks. A directory's date names
its edition or event; it does not establish an application version or prove
that the event has already happened.

## Pages Contract

Source of truth: [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

1. A push to `main` affecting a published directory or the workflow, or a manual
   dispatch, starts deployment.
2. Copy `ccw-hands-on-lab/.` into `_site/`.
3. Copy `20261116/.` over `_site/` as well, so the November portal (`index.html`)
   and invitation (`eDM.html`) are the site's main pages. Same-named general lab
   pages are replaced at the root; `assets/`, `v1/` and `START_HERE.txt` stay.
4. Copy `20261116/.` into `_site/20261116/`.
5. Copy `20261123/.` into `_site/20261123/` and `workshop-v2/.` into `_site/workshop-v2/`.
6. Build the offline ZIP from `ccw-hands-on-lab/` (not from the overlaid root).
7. Add `.nojekyll`, upload `_site`, and deploy the artifact to GitHub Pages.

The workflow supplies Pages permissions and the `github-pages` environment.
It has no PR trigger or review job. Root instructions and `docs/` are not
published; files inside the published directories, including Markdown notes,
are copied as-is. Public deployment URLs come from the repository's Pages
configuration and workflow output.

## Preview the Published Layout

Run from the repository root:

```bash
preview_dir=$(mktemp -d /tmp/claude-workshop-preview.XXXXXX)
mkdir -p "$preview_dir/20261116" "$preview_dir/20261123"
cp -a ccw-hands-on-lab/. "$preview_dir/"
cp -a 20261116/. "$preview_dir/"
cp -a 20261116/. "$preview_dir/20261116/"
cp -a 20261123/. "$preview_dir/20261123/"
touch "$preview_dir/.nojekyll"
python3 -m http.server 8000 --bind 127.0.0.1 --directory "$preview_dir"
```

Check `/` (November portal), `/eDM.html`, `/20261116/` and `/20261123/eDM.html`, including links, assets, navigation, and any changed
JavaScript behavior. `file://` previews alone do not establish that the published
relative paths work.

When changing the November labs or `tools/mydata/`, also run:

```bash
python3 -m unittest discover -s tools/mydata/tests -t .
python3 tools/mydata/build.py --version <v> && python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip
python3 tools/mydata/check_viz.py 20261116
```
