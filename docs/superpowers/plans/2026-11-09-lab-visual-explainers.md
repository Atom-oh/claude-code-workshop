# Lab Visual Explainers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every copy-paste step in the November Preflight and Chapter 1-6 labs understandable at L200: a plain Korean "what this does" note per command block, a badge saying where to paste it, and step-through animated diagrams (with official AWS icons) that show what is happening, starting with the S3 -> EC2 kit download.

**Architecture:** One shared, dependency-free browser component `20261116/assets/labviz.js` + `labviz.css` (inline SVG step player and command explainer), AWS Architecture Icons copied into `20261116/assets/aws-icons/`. Pages opt in with markup only: `<figure class="viz" data-viz="<name>">` and `<details class="cmd-explain">` right after a code block. Viz definitions (nodes, edges, steps, captions) live in `labviz.js` keyed by name. A stdlib Python test checks pages against the component.

**Tech Stack:** Vanilla JS (ES2017, no build), inline SVG, CSS variables from each page's theme, Python 3.9 `unittest` + `html.parser`.

**Spec:** user request 2026-11-09 (skipped the design questions): "L200 수준으로 친절한 설명, html이니까 동적으로 어떻게 동작하는지 보여줄 수 있는 visualize 포함. 터미널에 복붙이 많으니 내가 뭘 복사해서 넣는 건지 이해시켜야 하고, s3에서 받을 때도 S3 icon과 함께 EC2로 복사되는 AWS icon visualize로 쉽게 — 무슨 일이 일어나고 있는지." Builds on `docs/superpowers/specs/2026-11-09-fsi-mydata-lab-storyline-design.md` (lab content stays as is).

## Global Constraints

- Lab TASK content, commands, minutes, ids, TOC and pager stay unchanged; this work only adds explanation and visuals.
- Learner copy in Korean 합니다체, L200: no jargon without a one-line explanation; one idea per sentence.
- No external network dependencies: no CDN, no fonts, no analytics. Everything under `20261116/assets/`.
- Works in light and dark themes (use the page's CSS variables `--ink`, `--muted`, `--line`, `--panel`, `--accent`, `--ok`, `--err`, `--info`), on phone width, and with `prefers-reduced-motion: reduce` (show final state, no animation).
- Without JS the page still reads correctly: the `<details>` explainer is native HTML; a `<figure class="viz">` contains a static `<noscript>`-safe text fallback (`<figcaption>` with the step list).
- AWS icons are the official Architecture Icons (07312025 set), used unmodified, with labels; copy only the SVGs used.
- Copy-paste safety: the explainer never changes the copied text of a code block; copy buttons keep copying the original command only.
- `check_labs.py` must stay `OK`; the kit (`mydata-kit.zip`, sha256 `a9f64e89…`) does not change.

## Review Focus

1. **Copy button copies explainer text or line highlights alter the copied command** -> learner pastes garbage. Pinned in Task 1 (`test_copy_text_unchanged` on a fixture page, via the copy handler's source text).
2. **Dark theme / projector mode makes icons or arrows invisible** -> diagram unreadable in the room. Pinned in Task 1 (labviz.css uses only theme variables; test asserts no hard-coded `#fff`/`#000` fills in labviz.css except inside icon SVGs).
3. **A page references a viz name with no definition, or an explainer line range beyond the block** -> broken figure / wrong highlight. Pinned in Task 1 (`check_viz.py` + tests), run in every page task.
4. **Animation runs forever / steals focus / no keyboard control** -> accessibility and distraction. Pinned in Task 1 (player uses buttons with aria-labels, stops at the last step, `prefers-reduced-motion` honored).
5. **Explainer text drifts from the command it explains** -> misleading. Pinned per page task: every `cmd-explain` `li[data-lines]` range must exist and the reviewer checks wording against the command.

---

## File Structure

```
20261116/assets/labviz.js        # player + explainer + viz registry (window.LabViz)
20261116/assets/labviz.css       # styles using page CSS variables
20261116/assets/aws-icons/       # S3.svg, S3-Bucket.svg, EC2.svg, EC2-Instance.svg, Bedrock.svg, IAM.svg, CloudWatch.svg (+ README.md with source/licence note)
tools/mydata/check_viz.py        # check(labs_dir) -> list[str]
tools/mydata/tests/test_check_viz.py
20261116/ClaudeCode_Preflight_Check.html, ClaudeCode_Ch1..Ch6_HandsOnLab.html, ClaudeCode_Ch2_Guardrails_HandsOnLab.html
```

Markup contract (pages):

```html
<link rel="stylesheet" href="assets/labviz.css"><script defer src="assets/labviz.js"></script>   <!-- in <head> -->

<figure class="viz" data-viz="kit-download">
  <figcaption>그림: S3의 키트가 EC2(ccb-endpoint)로 복사되는 과정 — 1) … 2) … </figcaption>
</figure>

<div class="code copyable">…existing block…</div>
<details class="cmd-explain">
  <summary>이 블록이 하는 일 (붙여넣는 곳: 터미널)</summary>
  <ol>
    <li data-lines="1">KIT 변수에 키트가 있는 S3 주소를 담습니다.</li>
    <li data-lines="2-3">…</li>
  </ol>
</details>
```

JS behavior:
- `cmd-explain`: hovering/focusing an `li[data-lines]` highlights those 1-based lines in the preceding `.code` block's `<pre>` (wrap lines in spans at load; copy handler must read the original text — store it in `data-raw` before wrapping).
- Paste-target badge: for each `.code` block, derive from its `code-head` label (`bash`/Terminal -> "터미널에 붙여넣기", `text` -> "Claude 입력창에 붙여넣기", `json`/`yaml` -> "파일 내용(직접 붙여넣지 않음)" unless the block is a heredoc) and show a small badge; pages can override with `data-paste="terminal|claude|browser|file"` on the `.code` div.
- `figure.viz`: render SVG from `LabViz.defs[name]` = `{ viewBox, nodes:[{id,icon|shape,label,sub,x,y}], edges:[{id,from,to,label}], steps:[{caption, on:[ids], flow:{edge, token:"mydata-kit.zip"}}] }`. Controls: ▶ 재생 (auto-advance 1.6 s/step, stops at end), ◀ 이전, 다음 ▶, ↺ 처음; step dots; caption region `aria-live="polite"`.

---

### Task 1: Shared component, icons, guard + Preflight pilot (`kit-download`)

**Files:** Create `20261116/assets/labviz.js`, `labviz.css`, `aws-icons/*`, `tools/mydata/check_viz.py`, `tools/mydata/tests/test_check_viz.py`; Modify `20261116/ClaudeCode_Preflight_Check.html`.

**Interfaces:** Produces `window.LabViz = { defs, register(name, def) }`, the markup contract above, `check(labs_dir: Path) -> list[str]` (rules: every `data-viz` has a def name found in labviz.js `register("<name>"` or `defs` literal; every `cmd-explain` follows a `.code` block; every `data-lines` range within that block's line count; every page that uses either feature links `assets/labviz.css` and `assets/labviz.js`; every icon referenced in labviz.js exists under `assets/aws-icons/`).

- [ ] Tests first (`test_check_viz.py`): unknown viz name, explainer without preceding block, out-of-range lines, missing asset link, missing icon file, and `test_copy_text_unchanged` (parse labviz.js and assert the copy handler uses `data-raw`); labviz.css contains no hard-coded `#fff`/`#000`/`white`/`black` colors.
- [ ] Implement `labviz.js`/`labviz.css` (player, explainer highlight, paste badges, reduced motion, keyboard-operable buttons). `node --check 20261116/assets/labviz.js`.
- [ ] Viz `kit-download`, nodes: S3 bucket icon "Workshop Studio 에셋 버킷 (공개)" -> EC2 instance icon "ccb-endpoint (실습 PC)" containing folder `~/claude-lab/mydata`. Steps: (1) `aws s3 cp --no-sign-request`: zip 토큰이 S3에서 EC2의 /tmp로 이동 — 자격 증명 없이 공개 객체를 받음; (2) `unzip`: zip이 raw/ · pseudo/ · checkpoints/ 세 폴더로 펼쳐짐; (3) `sha256sum -c`: 각 파일 지문 확인, 하나라도 다르면 빨간색으로 멈춤; (4) `chmod -R a-w`: raw/ · pseudo/에 자물쇠 — 실수로 고치지 못함; (5) raw는 DLP 시연용(주민번호 등 가짜 원본), pseudo는 분석용(가명) 라벨.
- [ ] Preflight: add the viz before the CHECK 06 code block and a `cmd-explain` for every code block on the page (CHECK 01-06), each explaining paste target and each line in plain Korean.
- [ ] Verify: unit suite; `python3 tools/mydata/check_viz.py 20261116`; `check_labs.py` OK; open the page with a headless browser (Playwright, if available) in light and dark, take screenshots of the viz at steps 1 and 5, confirm no console errors; `git diff --check`. Commit `feat(20261116): add lab visual explainers and the kit download diagram`.

### Task 2: Ch1 explainers + `agent-loop`, `session-file`

**Files:** Modify `20261116/ClaudeCode_Ch1_HandsOnLab.html`; Modify `20261116/assets/labviz.js` (register defs).
- [ ] `agent-loop`: 사용자 프롬프트 -> Claude Code(EC2) -> Bedrock 모델(Bedrock icon) -> 도구 실행(Read/Bash on EC2) -> 결과 다시 모델로 -> 검증 -> 답. Steps match TASK 01's 수집 -> 수행 -> 검증 using the real prompt (customers.csv/pensions.csv).
- [ ] `session-file`: 대화·도구 결과가 `~/.claude/projects/…/*.jsonl`에 평문으로 쌓임 -> `grep 고객0` 이 찾아냄 -> 2장 보존 기간·DLP로 연결.
- [ ] TASK 00 restore block gets a short note + reuse `kit-download` viz (same name). `cmd-explain` for every code block; text-prompt blocks explain "Claude 입력창에 붙여넣기".
- [ ] Verify (as Task 1) + commit `docs(20261116): explain Ch1 steps visually`.

### Task 3: Ch2 Lab 1 explainers + `policy-layers`, `bedrock-path`
- [ ] `policy-layers`: managed-settings(/etc/claude-code, 보안 담당자) 위에 user(~/.claude), project(.claude) 층; deny(raw/**)가 user의 allow를 이김; Read 도구 요청 -> 거부 / pseudo -> 허용.
- [ ] `bedrock-path`: EC2(Claude Code) -> IAM 역할 -> Bedrock 추론 프로파일(global./us./apac.) -> 모델; 게이트웨이 모드에서는 Apps Gateway 경유(Task 7 viz 재사용 가능).
- [ ] `cmd-explain` for every block (sudo/jq 병합을 쉬운 말로). Verify + commit.

### Task 4: Ch2 Lab 2 explainers + `dlp-hook`, `fail-open-closed`
- [ ] `dlp-hook`: 프롬프트/도구 입력 -> UserPromptSubmit/PreToolUse 훅 -> `dlp-guard.sh`가 패턴(주민번호·카드·휴대폰·계좌·AWS 키) 검사 -> exit 2 차단(빨강) / exit 0 통과(초록); pseudo 예시는 통과.
- [ ] `fail-open-closed`: 스크립트 고장/없음/멈춤 때 fail-open(통과돼 버림) vs fail-closed(막힘) 비교.
- [ ] `cmd-explain` for every block, especially the heredoc script (줄별: jq로 입력 꺼내기, grep -E, exit 코드 의미). Verify + commit.

### Task 5: Ch3 explainers + `subagent-dispatch`, `tool-isolation`
- [ ] `subagent-dispatch`: 메인 Claude -> 패턴 A 자동 / B 명시 / C 병렬(spending/portfolio/risk 동시에) -> 결과 합쳐 `segments.md`.
- [ ] `tool-isolation`: risk-reviewer(tools: Read, Grep, Glob) Write 요청 -> 거부 -> tools에 Write 추가 -> 허용 -> .bak 복원.
- [ ] `cmd-explain` for every block (에이전트 정의 파일의 frontmatter 줄별). Verify + commit.

### Task 6: Ch4 explainers + `plugin-bundle`, `marketplace-install`
- [ ] `plugin-bundle`: agents 3 + skill retirement-gap + hooks(dlp-guard.sh) -> `asset-team-kit` 폴더 -> `plugin.json`.
- [ ] `marketplace-install`: 로컬 마켓플레이스 `fsi-local` 카탈로그 -> 동료 폴더에서 설치 -> `/asset-team-kit:retirement-gap` 사용 가능 -> `pension-product.md`; 플러그인 훅 vs managed 훅 차이 한 장면.
- [ ] `cmd-explain` for every block (mod 파일 포함). Verify + commit.

### Task 7: Ch5 + Ch6 explainers + `context-budget`, `gateway-policy`
- [ ] Ch5 `context-budget`: 컨텍스트 창 막대 — `head -n 400`(약 20,000자) 그대로 vs 필터 훅 후(약 2,600자); 압축(compaction) 장면: 오래된 대화가 요약으로 접히고 SessionStart 훅이 DLP 규칙을 다시 붙임.
- [ ] Ch6 `gateway-policy`: alice(자산분석팀) / bob(타 부서) -> Apps Gateway(로그인, 그룹 정책: 허용 모델·지출 한도) -> Bedrock 또는 차단; 텔레메트리 -> 대시보드(CloudWatch icon if the page's telemetry target is CloudWatch/OTel — use what the page says).
- [ ] `cmd-explain` for every block on both pages. Verify + commit (one per page).

### Task 8: Docs + final checks
- [ ] `docs/architecture.md` row for `20261116/assets/labviz.*` and `aws-icons/`; CHANGELOG "Added"; AGENTS.md Validation bullet adds `python3 tools/mydata/check_viz.py 20261116`; `aws-icons/README.md` notes the source set.
- [ ] Full unit suite, `check_viz.py`, `check_labs.py`, `node --check`, `git diff --check`; Playwright screenshots of one viz per page in dark theme. Commit `docs: record the lab visual explainers`.
