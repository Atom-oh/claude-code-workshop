# FSI MyData Lab Storyline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the November Preflight and Chapter 1-6 lab pages so every lab runs on one synthetic financial MyData bundle and tells the "bank customer-asset analyst" story, ending in a pension product proposal.

**Architecture:** A stdlib-only Python tool in `tools/mydata/` (outside every Pages-published directory) generates seeded raw and pseudonymized data, validates it against the single DLP pattern, and packs data plus per-chapter checkpoints into one `mydata-kit.zip`. That one zip is hosted behind a single download URL; Preflight downloads it once, and every chapter's TASK 00 restores missing prior artifacts from it. A `check_labs.py` guard ties the lab HTML to the bundle (paths, DLP pattern, time budget).

**Tech Stack:** Python 3.9+ stdlib (`csv`, `json`, `random`, `zipfile`, `hashlib`, `re`, `unittest`, `html.parser`), hand-edited static HTML in `20261116/`, AWS CLI with profile `workshop-2`.

**Spec:** `docs/superpowers/specs/2026-11-09-fsi-mydata-lab-storyline-design.md`

## Global Constraints

- All six chapters are rewritten before the 2026-11-16 event; no reduced scope.
- Chapter numbers, titles, and lab filenames follow the "November Event Chapters" table in `AGENTS.md`; learner folders keep old names (`~/claude-lab/ch4` etc.).
- Data lives at `~/claude-lab/mydata/` on ccb-endpoint, with `raw/` (identifiers, DLP demo only) and `pseudo/` (CI-style tokens, all analysis).
- About 1,000 customers; tens of thousands of transactions; fixed seed.
- `pseudo/` has zero DLP matches; `raw/` has many.
- Every identifier is a format-only fake value; card numbers use test ranges.
- Each chapter keeps its existing TASK skeleton and learning objectives; required-task minutes per page may exceed the page's current total (baseline commit `1c58d26`) by at most 30 (rough budgets; user schedule +-30 min).
- Each chapter starts with policy check/reset and ends with restore, as today.
- Ch2 keeps "policy cannot be bypassed" and DLP fail-closed; Ch3 keeps the three dispatch patterns; Ch4 keeps skill -> kit -> proposal; Ch6 keeps gateway login, group model policy, spend limit.
- Characters: the analyst (Ch1, Ch3, Ch4, Ch5) and the IT security/platform engineer (Ch2, Ch6). `alice` = asset-analysis team, `bob` = other team.
- Agent, skill, kit names: `spending-analyst`, `portfolio-analyst`, `risk-reviewer`, `retirement-gap`, kit `asset-team-kit` (replaces `fsi-team-kit`).
- Learner-facing text stays Korean; repo docs (README, CHANGELOG, architecture) stay English.
- Nothing under `tools/` is published; `tools/mydata/dist/` is gitignored.
- Learners download the kit with `aws s3 cp s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip` (Workshop Studio assets bucket, instance role); no curl, no signed URL.

## Review Focus

1. **A pseudonymized value, date, or amount accidentally matches the DLP regex** -> the analyst's Ch3/Ch4 session is blocked. Expect zero matches across every `pseudo/` file, CSV and JSON. Pinned in Task 2 (`test_pseudo_has_no_dlp_match_any_file`) and Task 1 (`test_dates_and_amounts_never_hyphenated_like_ids`).
2. **A learner starts Day 2 on a fresh instance or skipped a chapter** -> each chapter's TASK 00 must restore what it needs from the kit alone. Pinned in Task 4 (`test_every_task00_restore_path_in_manifest`).
3. **Learner shell cannot read the assets bucket (event-region bucket or instance-role permission differs)** -> learners cannot fetch data or checkpoints. Verified in the Task 13 rehearsal.
4. **The DLP regex in the lab HTML drifts from the one the validator uses** -> data passes validation but gets blocked, or raw data is not blocked. Pinned in Task 4 (`test_lab_dlp_pattern_matches_source`).
5. **Ch1 or Ch3 prompts make Claude read the large transaction files before Ch5** -> slow, costly sessions that blow the chapter time. Expect Ch1/Ch3 work on small summary files. Pinned in Task 1 (`test_summary_files_small`) and Task 4 (`test_ch1_ch3_do_not_reference_transaction_files`).

---

## File Structure

```
tools/mydata/
  README.md                 # how to generate, validate, build, publish (English)
  dlp_pattern.txt           # single source of the DLP regex (one line, ERE)
  generate.py               # generate(out_dir: Path, seed: int = 20261116) -> None
  validate.py               # validate(data_dir: Path) -> list[str]  (empty = pass); CLI exit 1 on errors
  build.py                  # build_kit(data_dir, checkpoints_dir, out_zip) -> Path; writes SHA256SUMS
  check_labs.py             # check(labs_dir, manifest) -> list[str]; CLI exit 1 on errors
  checkpoints/
    ch2/dlp-guard.sh
    ch3/agents/{spending-analyst,portfolio-analyst,risk-reviewer}.md
    ch3/segments.md
    ch4/asset-team-kit/...  # full plugin tree, matches Ch4 lab text
  tests/
    test_generate.py test_validate.py test_build.py test_check_labs.py
.gitignore                  # add tools/mydata/dist/
20261116/ClaudeCode_Preflight_Check.html, ClaudeCode_Ch1..Ch6_HandsOnLab.html, ClaudeCode_Ch2_Guardrails_HandsOnLab.html
docs/architecture.md, CHANGELOG.md
```

Kit layout inside `mydata-kit.zip` (extracted to `~/claude-lab/mydata/`):

```
raw/  pseudo/  checkpoints/ch2/ checkpoints/ch3/ checkpoints/ch4/  SHA256SUMS  VERSION
```

Run all tests with: `python3 -m unittest discover -s tools/mydata/tests -v`

---

### Task 1: Synthetic MyData generator

**Files:**
- Create: `tools/mydata/generate.py`, `tools/mydata/dlp_pattern.txt`, `tools/mydata/tests/test_generate.py`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `generate(out_dir: Path, seed: int = 20261116) -> None` writing `raw/` and `pseudo/` with identical file names:
  `customers.csv`, `bank_accounts.csv`, `bank_transactions.csv`, `cards.csv`, `card_transactions.csv`, `securities.csv`, `insurance.csv`, `loans.csv`, `pensions.csv`, `card_spend_monthly.csv` (customer x merchant category x month sums, derived from `card_transactions`), `mydata_api_sample.json`.
  Join key `customer_id` (`C0001`..). Identifier columns only in `customers.csv`, `bank_accounts.csv`, `cards.csv`: `name`, `rrn`, `mobile`, `account_no`, `card_no`. In `pseudo/` these become `ci` tokens (`CI_` + 16 hex, HMAC-SHA256 of the raw value with a seed-derived key) and `name` becomes `고객NNNN`.
  CLI: `python3 tools/mydata/generate.py --out tools/mydata/dist/data`.
- `dlp_pattern.txt` (exact content, one line):
  `[0-9]{6}-[1-4][0-9]{6}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}|01[016789]-[0-9]{3,4}-[0-9]{4}|[0-9]{3}-[0-9]{2,6}-[0-9]{5,7}|AKIA[0-9A-Z]{16}`
  (existing RRN, card, AWS key; added mobile and account.)

Fake-value rules: RRN birth part from the customer's age, serial part starting `9` (`YYMMDD-[1-4]9xxxxx`); card `4111-1111-1111-NNNN` or `5555-5555-5555-NNNN`; mobile `010-0NNN-NNNN` (unassigned `0` exchange prefix); account `NNN-NNNNNN-NNNNN`. Dates are `YYYYMMDD` (no hyphens); amounts are plain integers.

Seeded segments (each ≥ 8% of customers so Ch3 finds them): (a) age 40-55, income band top two, no IRP or IRP balance < 5,000,000 KRW; (b) age 58-64 with ≥ 80% of retirement pension in DB type; (c) age 25-34 with high card spend and no pension savings.

- [ ] **Step 1: Write failing tests** in `test_generate.py`:
  - `test_deterministic`: two runs with the same seed give byte-identical files; another seed differs.
  - `test_counts`: `customers.csv` has 1000 rows; `bank_transactions` + `card_transactions` rows total between 30,000 and 80,000.
  - `test_raw_pseudo_same_shape`: same files, same row counts, same non-identifier columns.
  - `test_identifier_formats`: every raw `rrn`, `card_no`, `mobile`, `account_no` matches its format rule above.
  - `test_dates_and_amounts_never_hyphenated_like_ids`: no non-identifier cell in any file contains `-` between digits.
  - `test_seeded_segments_present`: each of segments (a), (b), (c) is ≥ 80 customers.
  - `test_summary_files_small`: `customers.csv`, `pensions.csv`, `securities.csv`, `insurance.csv`, `loans.csv`, `card_spend_monthly.csv` are each < 300 KB (aggregate `card_spend_monthly` to the 12 most recent months and top categories if needed); transaction files are each > 1 MB; `card_spend_monthly` totals equal `card_transactions` totals per customer for the covered months.
- [ ] **Step 2: Run** `python3 -m unittest tools.mydata.tests.test_generate -v` (from repo root with `tools/__init__.py`, `tools/mydata/__init__.py`, `tests/__init__.py` present) — Expected: FAIL, import error.
- [ ] **Step 3: Implement `generate()`** with `random.Random(seed)`; build customers first, then derive every other table from each customer's profile so segments come from profile rules, not post-hoc edits. Write CSV as UTF-8 without BOM.
- [ ] **Step 4: Run tests** — Expected: PASS.
- [ ] **Step 5: Add `tools/mydata/dist/` to `.gitignore`; commit** `feat(tools): add seeded synthetic MyData generator`.

### Task 2: Data validator

**Files:**
- Create: `tools/mydata/validate.py`, `tools/mydata/tests/test_validate.py`

**Interfaces:**
- Consumes: Task 1 output layout, `dlp_pattern.txt`.
- Produces: `load_pattern() -> re.Pattern` (reads `dlp_pattern.txt`, converts ERE `{m,n}` as-is for Python `re`), `validate(data_dir: Path) -> list[str]`. CLI `python3 tools/mydata/validate.py tools/mydata/dist/data` exits 0 and prints `OK` or exits 1 and prints one error per line.

- [ ] **Step 1: Write failing tests:**
  - `test_generated_data_passes`: `validate()` on fresh `generate()` output returns `[]`.
  - `test_pseudo_has_no_dlp_match_any_file`: injecting `010-0123-4567` into any `pseudo/` CSV cell **or** JSON string returns an error naming the file and line.
  - `test_raw_has_matches`: raw with all identifiers replaced by tokens returns an error "raw/ has fewer than 1000 DLP matches".
  - `test_row_count_mismatch`: deleting one row in `pseudo/loans.csv` returns an error.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement.** Scan every file under `pseudo/` as text line by line (covers CSV and JSON).
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(tools): validate MyData against the DLP pattern`.

### Task 3: Kit builder

**Files:**
- Create: `tools/mydata/build.py`, `tools/mydata/tests/test_build.py`, `tools/mydata/checkpoints/.keep`

**Interfaces:**
- Consumes: `generate()`, `validate()`.
- Produces: `build_kit(data_dir: Path, checkpoints_dir: Path, out_zip: Path, version: str) -> Path`. Refuses (raises `ValueError`) if `validate()` returns errors. Zip root contains `raw/`, `pseudo/`, `checkpoints/`, `SHA256SUMS` (sha256sum format, relative paths), `VERSION`. `.sh` files keep mode 0755. Also `manifest(zip_path) -> set[str]` returning the relative paths inside. CLI `python3 tools/mydata/build.py --version 2026.11.1` runs generate -> validate -> build into `tools/mydata/dist/mydata-kit.zip` and prints its sha256.

- [ ] **Step 1: Write failing tests:** `test_build_contains_layout`, `test_sha256sums_verify` (recompute every entry), `test_refuses_invalid_data`, `test_shell_scripts_executable`, `test_zip_reproducible` (fixed timestamps, same bytes twice).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** with `zipfile.ZipInfo` fixed `date_time=(2026,11,16,0,0,0)` and sorted entries.
- [ ] **Step 4: Run** — PASS. Also verify on macOS: `unzip -q dist/mydata-kit.zip -d /tmp/k && cd /tmp/k && shasum -a 256 -c SHA256SUMS` -> all `OK`.
- [ ] **Step 5: Commit** `feat(tools): pack MyData and checkpoints into one kit`.

### Task 4: Lab guard (`check_labs.py`)

**Files:**
- Create: `tools/mydata/check_labs.py`, `tools/mydata/tests/test_check_labs.py`

**Interfaces:**
- Consumes: `load_pattern()`, `manifest()`.
- Produces: `check(labs_dir: Path, manifest: set[str], baseline_rev: str = "1c58d26") -> list[str]`. Lab pages = Preflight + the seven chapter pages in the Global Constraints table. Checks:
  1. Every `~/claude-lab/mydata/<path>` in a page (HTML-unescaped) exists in `manifest`.
  2. Every `PAT='...'` in a page equals `dlp_pattern.txt` exactly.
  3. Each chapter page's TASK 00 section contains a restore command referencing `~/claude-lab/mydata/checkpoints/` for every prior artifact the page uses (rule table in the module: Ch2 Guardrails -> none, Ch3 -> `ch2/`, Ch4 -> `ch2/`, `ch3/`, Ch5 -> `ch4/`, Ch6 -> none), and a re-download fallback using `aws s3 cp` of the `s3://.../mydata-kit.zip` URI.
  4. Sum of `(N분)` in required-task `<h2>` headings (not starting with `선택`) ≤ the same sum in `git show <baseline_rev>:20261116/<page>` plus `TIME_TOLERANCE_MIN` (30).
  5. Ch1 and Ch3 pages never reference `bank_transactions.csv` or `card_transactions.csv`.
  6. Every page that downloads the kit uses the identical `s3://.../mydata-kit.zip` URI; any `https://MYDATA_KIT_URL` or `curl` of `mydata-kit.zip` is an error.
  CLI: `python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip`.

- [ ] **Step 1: Write failing tests** with small fixture HTML strings: `test_unknown_mydata_path`, `test_lab_dlp_pattern_matches_source`, `test_every_task00_restore_path_in_manifest`, `test_time_budget_exceeded`, `test_time_budget_within_tolerance`, `test_curl_kit_download_rejected`, `test_ch1_ch3_do_not_reference_transaction_files`, `test_inconsistent_kit_url`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** using `html.parser` to split sections by `<h2>`.
- [ ] **Step 4: Run** — PASS. Running the CLI on the current pages is expected to fail (pages not yet converted); record the error list in the commit body.
- [ ] **Step 5: Commit** `feat(tools): guard lab pages against the MyData kit`.

> Tasks 5-11 each edit one or two lab pages. Shared rules for all of them:
> - Edit HTML directly; keep the existing `code copyable` blocks, `alert` boxes, `check` checkpoints, TOC, and pager.
> - Kit download uses `KIT=s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip` and `aws s3 cp`, never curl.
> - Every TASK 00 ends with this restore idiom (adapt the checkpoint list per page):
>   `[ -d ~/claude-lab/mydata/pseudo ] || (aws s3 cp "$KIT" /tmp/mydata-kit.zip --only-show-errors && mkdir -p ~/claude-lab/mydata && unzip -qo /tmp/mydata-kit.zip -d ~/claude-lab/mydata)`, then copy the needed `checkpoints/chN/` items only if the learner's own are missing.
> - Each task ends by running `python3 -m unittest discover -s tools/mydata/tests` and `python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip`, filtering to errors for the page(s) it touched — Expected: none for those pages. Then `git diff --check`, preview the page in a browser at `20261116/<page>`, and commit `docs(20261116): <chapter> on the MyData storyline`.
> - Checkpoint files the task adds must be byte-identical to what the page tells learners to create (copy from the page's heredoc).

### Task 5: Preflight CHECK 06

**Files:** Modify `20261116/ClaudeCode_Preflight_Check.html`

- [ ] Add CHECK 06 "마이데이터 내려받기 (2분)": `mkdir -p ~/claude-lab/mydata`, `aws s3 cp` the kit, `unzip -qo`, `cd ~/claude-lab/mydata && sha256sum -c SHA256SUMS | tail -3`, `cat VERSION`, `chmod -R a-w raw pseudo`. Checkpoint: `ls ~/claude-lab/mydata` shows `raw pseudo checkpoints`. Add a "테스트 데이터만" warning box and a 문제가 있을 때 row for a failed download (retry once, then raise your hand).
- [ ] Verify, preview, commit (shared rules).

### Task 6: Ch1 on MyData

**Files:** Modify `20261116/ClaudeCode_Ch1_HandsOnLab.html`

- [ ] TASK 00: work folder `~/claude-lab/ch1-loop` with `ln -s ~/claude-lab/mydata/pseudo data`; keep git init. Replace `calc.py` with a task on `data/customers.csv` and `data/pensions.csv` (for example "연령대별 고객 수와 퇴직연금 보유율을 표로 만들고 숫자를 스스로 검증해줘"), so the gather -> act -> verify loop is still observable.
- [ ] TASK 02 Step 3: `grep -c '고객0' <session jsonl>` shows customer rows stored verbatim; add a sentence pointing to Ch2's retention and DLP policies. Persona sentence in the intro: the analyst's first session of the day.
- [ ] Verify, preview, commit.

### Task 7: Ch2 Lab 1, raw data blocked by policy

**Files:** Modify `20261116/ClaudeCode_Ch2_HandsOnLab.html`

- [ ] Intro and section leads in the security engineer's voice. TASK 00 stops creating `.env`/`secrets`; instead symlinks `~/claude-lab/mydata/raw` as `~/claude-lab/ch2/raw` and `pseudo` as `pseudo`.
- [ ] TASK 02/03: the deny rule targets `Read(~/claude-lab/mydata/raw/**)` and the symlinked path; TASK 03 Step 1 asks Claude to read `raw/customers.csv` (blocked) and then `pseudo/customers.csv` (allowed). Keep the personal-settings override attempt and its failure.
- [ ] Decide and record in the page whether TASK 06 (gateway) stays here; keep it unless the page exceeds its time budget (check 4).
- [ ] Verify, preview, commit.

### Task 8: Ch2 Lab 2, DLP on MyData + `ch2` checkpoint

**Files:** Modify `20261116/ClaudeCode_Ch2_Guardrails_HandsOnLab.html`; Create `tools/mydata/checkpoints/ch2/dlp-guard.sh`

- [ ] Replace the one-row `customers.csv` with `~/claude-lab/mydata/raw/customers.csv` (`head -3` into the work folder). Both `PAT=` lines become the exact `dlp_pattern.txt` string. Add one blocked example each for mobile and account (`010-0123-4567`, `123-456789-01234`).
- [ ] Add one line confirming the hook passes analysis: `claude -p "pseudo/customers.csv 연령대 분포를 요약해줘"` succeeds.
- [ ] Trim optional tasks (sandbox, Guardrails, extension control) only if check 4 fails; record what was trimmed in the commit body.
- [ ] Write `checkpoints/ch2/dlp-guard.sh` identical to the page's final fail-closed script.
- [ ] Verify, preview, commit.

### Task 9: Ch3 subagents on MyData + `ch3` checkpoint

**Files:** Modify `20261116/ClaudeCode_Ch3_HandsOnLab.html`; Create `tools/mydata/checkpoints/ch3/agents/*.md`, `tools/mydata/checkpoints/ch3/segments.md`

- [ ] TASK 00: `~/claude-lab/ch4` with `pseudo/` symlinked, git init, a `CLAUDE.md` naming the analyst's goal; restore `ch2/dlp-guard.sh` note if missing (informational only, Ch3 does not enforce DLP). Remove the Node user-service; drop the `jq`-only step if unused.
- [ ] TASK 01: `spending-analyst` first (replaces code-reviewer). It infers spending patterns and life stage from `pseudo/card_spend_monthly.csv` and `bank_accounts.csv`, never from the transaction files (check 5; those belong to Ch5).
- [ ] TASK 02: `risk-reviewer` is the read-only agent for the permission-isolation demo.
- [ ] TASK 03: add `portfolio-analyst`; TASK 04 patterns A/B/C run segment analysis; pattern C runs the three agents in parallel and writes `segments.md` containing segments (a)-(c) from Task 1 with a service/product idea each. Cost check step stays.
- [ ] Optional TASK 05: headless call produces `segments.json` (nightly report framing).
- [ ] Checkpoint files = the page's heredocs; `segments.md` = a reference result from one real run on the kit, with no DLP matches.
- [ ] Verify, preview, commit.

### Task 10: Ch4 skill, kit, pension proposal + `ch4` checkpoint

**Files:** Modify `20261116/ClaudeCode_Ch4_HandsOnLab.html`; Create `tools/mydata/checkpoints/ch4/asset-team-kit/**`

- [ ] TASK 00 restores `ch3/agents` and `ch3/segments.md` and `ch2/dlp-guard.sh` when missing (check 3).
- [ ] New TASK 01 "retirement-gap 스킬 만들기 (8분)": `.claude/skills/retirement-gap/SKILL.md` with fixed procedure (inputs: segment or `ci`; columns from `pensions.csv`, `customers.csv`; output table: 예상 수령액, 목표 대비 격차, 보완 수단), run it once on segment (a).
- [ ] Former TASK 01/02 become the `asset-team-kit` plugin (3 agents + `retirement-gap` + DLP hook as plugin hook) and local marketplace install; the hook-source line reads `asset-team-kit@fsi-local`.
- [ ] New TASK "연금상품 기획서 완성 (8분)": with the kit, produce `pension-product.md` (target segment, product structure such as IRP + 연금저축 linkage, benefits, evidence metrics, risks/caveats); then send `고객 900101-1234567 조회해줘` to show the plugin hook blocks it, with an `alert info` that plugin hooks can be disabled by users and the managed hook from Ch2 is the enforcement path.
- [ ] Mod tasks stay; shrink the optional idle-compaction mod first if check 4 fails. Mod-control TASK narrated by the security engineer.
- [ ] Checkpoint `asset-team-kit/` = the page's final plugin tree.
- [ ] Verify, preview, commit.

### Task 11: Ch5 and Ch6 on MyData

**Files:** Modify `20261116/ClaudeCode_Ch5_HandsOnLab.html`, `20261116/ClaudeCode_Ch6_HandsOnLab.html`

- [ ] Ch5 TASK 00 restores `ch4/asset-team-kit` if missing. TASK 01 baseline: ask Claude to "summarize `pseudo/card_transactions.csv`" and record tokens via `/context` or `/cost`. TASK 02: the filter hook truncates `cat`/`head` output of `*_transactions.csv` to header + 50 lines + row count; compare. TASK 03 uses `retirement-gap` as the skill example. TASK 04 keeps the compact hook pinning "[사내 규정] 고객 주민등록번호·카드번호·계좌번호·휴대폰 번호는 출력하거나 파일에 쓰지 않는다".
- [ ] Ch6: intro in the security engineer's voice; `alice` = 자산분석팀, `bob` = 타 부서, in the account table. Verify against the running Apps Gateway whether group-level plugin distribution exists (gateway admin console or its docs in `../claude-code-on-bedrock-deep-dive-workshop-with-apps-gateway`). If yes, add a step showing `bob` cannot install `asset-team-kit`; if no, add one sentence framing the model policy and spend limit as the control and record the finding in the commit body. Closing paragraph: the analyst's proposal is done; the organization sees and controls usage.
- [ ] Verify both pages, preview, commit.

### Task 12: Build, upload, and verify the kit

**Files:** Create `tools/mydata/README.md`

- [ ] **Step 1:** Ask the user to refresh the `workshop-2` credentials (`! <their login command>`), then `aws sts get-caller-identity --profile workshop-2`.
- [ ] **Step 2:** `python3 tools/mydata/build.py --version 2026.11.1`; `python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip` — Expected: `OK` for all pages.
- [ ] **Step 3:** Copy `tools/mydata/dist/mydata-kit.zip` into `/Users/atomoh/github/claude-code/claude-code-on-bedrock-deep-dive-workshop-with-apps-gateway/assets/`.
- [ ] **Step 4:** Upload that one object: `aws s3 cp --profile workshop-2 <zip> s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip`. Do NOT sync the whole directory and do NOT delete anything in the bucket prefix.
- [ ] **Step 5:** Verify with `aws s3api head-object --profile workshop-2` (size equals the local zip) and download the object again, then compare its sha256 with the local zip.
- [ ] **Step 6:** Write `tools/mydata/README.md` (generate, validate, build, upload, verify). Commit `feat(20261116): host the MyData kit`. `check_url.py` is dropped: there is no signed URL to check.

### Task 13: Rehearsal, delivery copy, docs

**Files:** Modify `docs/architecture.md`, `CHANGELOG.md`; delivery copy `~/Documents/ClaudeCodeWorkshop/FSI_202611/02_HandsOnLab/`

- [ ] **Step 1: Rehearsal on a real ccb-endpoint** (needs a running event environment; ask the user for one). Run Preflight -> Ch6 in order as a learner, timing each page; then on a **fresh** instance start directly at Ch4 and Ch5 using only TASK 00 restore. Expected: every CHECKPOINT passes, Ch3/Ch4 never hit DLP on `pseudo/`, each page within its baseline minutes. Record timings in the commit body.
- [ ] **Step 2:** Fix anything the rehearsal finds in the owning page and its checkpoint; rerun tests and `check_labs.py`.
- [ ] **Step 3:** Update `docs/architecture.md` (add `tools/mydata/`, not published) and `CHANGELOG.md` (English).
- [ ] **Step 4:** Copy the eight pages to the delivery folder, mapping new names to that folder's filenames (`preflight.html`, `ch1-how-it-works.html` ...); ask the user to confirm the mapping first, since that folder's names still follow the old numbering and are uploaded to SharePoint.
- [ ] **Step 5:** Open a PR from `docs/mydata-lab-storyline` per `docs/review.md`; do not merge without review coverage on the latest HEAD.
