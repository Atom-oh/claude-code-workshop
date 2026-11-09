# FSI 캡스톤 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 20261116 행사의 캡스톤을 "내 agents와 가드레일(R1) → 내 plugin 배포와 재사용(R2)" 구조로 바꾸고, 라운드마다 고를 수 있는 미션 페이지(R1 셋 중 하나, R2 셋 중 둘 이상)와 준비, 출품, 포털, eDM, 영상까지 맞춘다.

**Architecture:** 학습자 페이지는 기존 캡스톤 페이지처럼 스타일이 내장된 독립 HTML이다. `ClaudeCode_Capstone_Setup.html`을 템플릿으로 복제해 새 페이지 8장을 만든다. 페이지 간 일관성(링크, 필수 절, 시간 합계, 키 유출, 아카이브 안내)은 마이데이터 랩의 `tools/mydata/check_labs.py`와 같은 방식의 체커 `tools/capstone/check_capstone.py`와 unittest로 지킨다. 트랙 B의 MCP 골격과 합성 샘플은 Pages로 배포되는 `20261116/capstone/` 아래에 두고 학습자가 `curl`로 받는다.

**Tech Stack:** 정적 HTML/CSS/JS(내장), Python 3 표준 라이브러리 + unittest(체커), Python `mcp` SDK의 FastMCP(트랙 B 골격), Remotion 프로젝트 `../fsi-workshop-video`(영상), Amazon Polly(내레이션 한 줄).

**Spec:** `docs/superpowers/specs/2026-11-09-fsi-capstone-redesign-design.md` (2026-11-09 승인)

## Global Constraints

- 장 번호와 제목은 `AGENTS.md` "November Event Chapters" 표를 따른다. 캡스톤 시간: R1 Day 1 15:50–17:40 (110분), 쇼케이스 1 17:40–18:00, R2 Day 2 13:40–16:40 (180분), 쇼케이스 2 17:40–18:00 (`20261116/eDM.html` 기준, PR #22 이후에도 그대로).
- 한 사람이 한 팀이다. AgentCore는 선택이다. 실습 EC2는 Administrator 권한이고 인터넷은 모두 열려 있다. 서울 공공데이터 API 키는 교육생이 직접 받는다.
- 기존 `ClaudeCode_Capstone1–7`, `CapstoneA–D` 파일은 지우지도 이름을 바꾸지도 않는다. "예전 예시"로 남긴다.
- 학습자 텍스트는 한국어. 새로 쓰는 문장에 em dash(U+2014)를 쓰지 않는다. 덱을 고치면 가운뎃점(U+00B7)도 쓰지 않는다.
- 사실 관계: 플러그인 이름, 명령, API 필드, AgentCore 절차는 공식 문서나 실제 설치로 확인한 값만 쓴다. 확인 못 한 값은 페이지에 넣지 않는다.
- 저장소 규칙: Conventional Commits, `git diff --check`, PR마다 content-review-agent PASS(85% 이상)를 최신 HEAD에 대해 받고 병합한다 (`docs/review.md`).
- 마이데이터 랩 개편(로컬 브랜치 `docs/mydata-lab-storyline`, 커밋 `5a42e97` 기준)이 main에 병합된 뒤 그 위에서 시작한다. 트랙 A는 그 키트(`s3://…/mydata-kit.zip`, `checkpoints/ch3/`, `checkpoints/ch4/asset-team-kit/`)를 그대로 쓴다.

## Review Focus

1. **랩을 못 끝낸 트랙 A 교육생:** `~/claude-lab/mydata`나 Ch3 산출물이 없어도 R1-A를 시작할 수 있어야 한다. → Task 4의 체커 규칙 `r1a_restore`가 키트 복구 명령을 요구한다.
2. **API 키가 아직 안 나온 트랙 B 교육생:** 키 없이도 MCP 골격이 샘플을 돌려줘야 한다. → Task 5의 `test_mock_mode_without_key`.
3. **API 키나 개인정보가 plugin 저장소, 샘플, 출품물에 섞임:** → Task 1의 `secret_scan` 규칙과 Task 5의 키 차단 훅 테스트.
4. **Administrator 권한 EC2에서 지우거나 비싼 AWS 작업이 확인 없이 실행됨, AgentCore 리소스가 남아 비용 발생:** → Task 8의 `r2_3_cleanup` 규칙(정리 단계와 ask 규칙 예시 필수).
5. **라운드 시간 초과:** 페이지의 단계 시간 합이 R1 110분, R2 180분을 넘음. → Task 1의 `time_budget` 규칙.

---

## File Structure

| 파일 | 역할 |
|---|---|
| `tools/capstone/__init__.py`, `tools/capstone/check_capstone.py` | 캡스톤 페이지 일관성 체커 (CLI + `check(root) -> list[str]`) |
| `tools/capstone/tests/test_check_capstone.py` | 체커 규칙별 unittest (임시 디렉터리 픽스처) |
| `tools/capstone/tests/test_seoul_skeleton.py` | 트랙 B 골격의 mock 모드와 키 처리 테스트 |
| `20261116/ClaudeCode_Capstone_Overview.html` | 캡스톤 개요: 목표, 미션 고르기, 완주 체크리스트 7항목, 출품 양식 |
| `20261116/ClaudeCode_Capstone_R1A_HandsOnLab.html` | R1-A 고객 맞춤 서비스 (마이데이터) |
| `20261116/ClaudeCode_Capstone_R1B_HandsOnLab.html` | R1-B 서울 부동산 시세 (공공데이터 MCP 직접 제작) |
| `20261116/ClaudeCode_Capstone_R1C_HandsOnLab.html` | R1-C 내가 고른 MCP (추천 목록) |
| `20261116/ClaudeCode_Capstone_R2_Package_HandsOnLab.html` | R2 공통: plugin으로 묶어 마켓플레이스 배포, 새 폴더 설치 |
| `20261116/ClaudeCode_Capstone_R2_1_HandsOnLab.html` | R2-1 정기 분석 리포트 |
| `20261116/ClaudeCode_Capstone_R2_2_HandsOnLab.html` | R2-2 기획안 작성 |
| `20261116/ClaudeCode_Capstone_R2_3_HandsOnLab.html` | R2-3 AgentCore 앱 (선택, 정리 단계 포함) |
| `20261116/capstone/seoul-realestate/server.py`, `sample.json`, `README.md` | 트랙 B MCP 골격(mock 모드), 합성 샘플 |
| 수정: `20261116/ClaudeCode_Capstone_Setup.html` | 필수/선택 구분, 출품 절 교체 |
| 수정: `20261116/ClaudeCode_Capstone1–7`, `CapstoneA–D` (11개) | 상단 아카이브 안내만 추가 |
| 수정: `20261116/index.html`, `eDM.html`, `eDM.txt`, `eDM-notes.md` | 캡스톤 카드, 흐름 칩, R1/R2 설명 |
| 수정: `../fsi-workshop-video/src/scenes.tsx`, `narration/script.json` → `20261116/media/intro-90s.mp4`, `intro-90s.ko.vtt` | 캡스톤 장면 한 줄 |

**페이지 공통 마크업 계약** (체커가 읽는다, 모든 새 페이지가 지킨다)
- 단계마다 `<section class="task" id="…" data-min="N">`. 라운드 시간 합계는 `data-min` 합이다.
- 상단에 `<p class="round" data-round="R1|R2">`.
- 아카이브 안내: `<div class="archive-note">예전 예시입니다. 새 캡스톤은 <a href="ClaudeCode_Capstone_Overview.html">여기</a>.</div>`

---

### Task 1: 캡스톤 체커와 테스트

**Files:**
- Create: `tools/capstone/__init__.py`, `tools/capstone/check_capstone.py`, `tools/capstone/tests/__init__.py`, `tools/capstone/tests/test_check_capstone.py`

**Interfaces:**
- Produces: `check(root: Path) -> list[str]` (문제 메시지 목록, 빈 목록이면 통과), CLI `python3 tools/capstone/check_capstone.py [root]` (기본 `20261116`, 문제가 있으면 exit 1). 상수 `NEW_PAGES: list[str]`(위 표의 새 HTML 8개), `ARCHIVE_PAGES: list[str]`(기존 11개), `R1_PAGES`, `R2_PAGES`, `BUDGET = {"R1": 110, "R2": 180}`.

규칙 (각 규칙은 메시지 앞에 규칙 이름을 붙인다):
- `exists`: `NEW_PAGES`가 모두 있다.
- `links`: 새 페이지, `index.html`, `ClaudeCode_Capstone_Setup.html`의 로컬 `href`/`src`가 실제 파일을 가리킨다 (앵커 `#id`도 대상 파일에 있어야 한다).
- `overview_checklist`: Overview에 `data-check="1"`부터 `"7"`까지 7개 항목, `id="submit"` 절이 있다.
- `time_budget`: `data-round`별로 R1 페이지 각각의 `data-min` 합 ≤ 110. R2는 Package 페이지 + R2 미션 페이지 중 가장 긴 두 개의 합 ≤ 180.
- `archive`: `ARCHIVE_PAGES` 각각에 `class="archive-note"`와 Overview 링크가 있다.
- `portal`: `index.html`의 `id="capstones"` 절이 새 페이지 8개를 모두 링크하고, `id="capstone-archive"` 하위 절이 기존 11개를 링크한다.
- `secret_scan`: 새 페이지와 `20261116/capstone/` 아래 파일에 실제 키처럼 보이는 값이 없다. 패턴: `[0-9a-f]{30,}`(16진 30자 이상), `AKIA[0-9A-Z]{16}`, `(?i)(api[_-]?key|KEY)\s*[=:]\s*["']?[A-Za-z0-9]{16,}`. `YOUR_KEY`, `<…>`, `sample` 같은 자리표시는 허용.
- `guardrail_note`: R2 Package 페이지에 "managed" 정책 안내 문장(`data-note="managed-enforce"`)이 있다.

- [ ] **Step 1: 테스트 작성.** 임시 디렉터리에 최소 HTML을 만들어 규칙마다 통과 1건, 실패 1건을 둔다. 예:

```python
def test_time_budget_fails_when_r1_over_110(self):
    root = make_site(self.tmp, r1a_minutes=[60, 55])   # 115분
    msgs = check(root)
    self.assertTrue(any(m.startswith("time_budget") and "R1A" in m for m in msgs))

def test_secret_scan_flags_hex_key_but_not_placeholder(self):
    root = make_site(self.tmp, extra={"capstone/x/README.md": "SEOUL_API_KEY=YOUR_KEY\n"})
    self.assertFalse([m for m in check(root) if m.startswith("secret_scan")])
    (root / "capstone/x/README.md").write_text("SEOUL_API_KEY=4a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d\n")
    self.assertTrue([m for m in check(root) if m.startswith("secret_scan")])
```

`make_site(tmp, **overrides) -> Path`는 테스트 파일 안의 도우미로, 모든 규칙을 통과하는 최소 사이트를 만들고 인자로 한 곳만 망가뜨린다.

- [ ] **Step 2: 실패 확인.** Run: `python3 -m unittest tools.capstone.tests.test_check_capstone -v` → Expected: `ModuleNotFoundError` 또는 FAIL.
- [ ] **Step 3: `check_capstone.py` 구현.** `html.parser`나 정규식으로 충분하다. 외부 패키지 없음.
- [ ] **Step 4: 통과 확인.** 같은 명령 → 전부 PASS. 실제 트리에서는 아직 페이지가 없으므로 `python3 tools/capstone/check_capstone.py`가 `exists` 메시지를 내며 exit 1인 것이 정상이다.
- [ ] **Step 5: 커밋.** `git add tools/capstone && git commit -m "test(tools): add the capstone page checker"`

### Task 2: Capstone Setup 개편

**Files:**
- Modify: `20261116/ClaudeCode_Capstone_Setup.html` (SETUP 03, SETUP 04, `#submit` 절, 상단 메타)

**Interfaces:**
- Produces: 앵커 `#required`(필수 설치 묶음), `#optional`(선택 세트), `#submit`(출품은 Overview로 안내). Overview와 미션 페이지가 이 앵커를 링크한다.

- [ ] **Step 1:** 필수 묶음을 한 블록(`id="required"`)으로 만든다: HUD, superpowers, AWS 툴킷 6종(기존 루프 유지), plugin-dev, agent-sdk-dev, hookify. 세 개는 기존 루프 형식으로 `claude plugin install "$p@claude-plugins-official"`. 설치 전에 `claude plugin` 목록이나 공식 마켓에서 세 이름이 실제로 있는지 확인하고, 없으면 그 항목을 빼고 PR 본문에 적는다.
- [ ] **Step 2:** 나머지 풀 스택 세트를 `id="optional"`로 표시하고, "다 켜면 상시 약 6만 토큰" 경고 옆에 Ch5 링크(`ClaudeCode_Ch5_HandsOnLab.html`)를 둔다. "Update 2026.07"을 "2026.11"로.
- [ ] **Step 3:** `#submit` 절을 "출품은 캡스톤 개요의 출품 양식을 따릅니다" 한 문단과 `ClaudeCode_Capstone_Overview.html#submit` 링크로 바꾼다. CloudFront 배포 안내는 "(선택) 앱을 만든 사람만" 한 줄로 줄인다.
- [ ] **Step 4:** Run: `python3 tools/capstone/check_capstone.py 2>&1 | grep -E '^links.*Setup'` → Expected: 출력 없음(Overview 링크는 Task 3 이후 해소되므로 이 단계에서는 `Overview` 대상 메시지만 남아도 된다). `git diff --check`.
- [ ] **Step 5:** 커밋 `docs(20261116): split the capstone setup into required and optional plugins`.

### Task 3: 캡스톤 개요 페이지

**Files:**
- Create: `20261116/ClaudeCode_Capstone_Overview.html` (Setup 페이지의 `<head>`, 스타일, 상단 바, 테마 스크립트를 복제)

**Interfaces:**
- Consumes: Task 2의 `#required`.
- Produces: `#missions-r1`, `#missions-r2`, `#checklist`(data-check 1–7), `#submit`. 미션 페이지 8장이 "개요로" 링크와 체크리스트 번호로 참조한다.

내용 (spec 1, 2, 4, 7장): 목적 한 단락(사용자 문장 그대로: "본인만의 agents를 만들고 계속 사용 가능한 plugin을 사내에 배포해서 사용하며, 공통으로 사용하는 가드레일을 만든다"), 진행 순서(SETUP → R1 → 쇼케이스 1 → R2 → 쇼케이스 2와 시간), R1 미션 카드 3장, R2 미션 카드 3장 + "R2 공통 단계" 카드, 완주 체크리스트 7항목(spec 7장 문구), 출품 양식(spec 7장 5개 항목, R1과 R2 미션 이름 포함), 반목표를 "이러면 완주가 아닙니다" 상자로.

- [ ] **Step 1:** 페이지 작성. 체크리스트 항목은 `<li data-check="N">`.
- [ ] **Step 2:** Run: `python3 tools/capstone/check_capstone.py | grep -E '^(overview_checklist|links).*Overview'` → Expected: 체크리스트 메시지 없음. 미션 페이지 링크 미해소 메시지는 Task 4–8에서 해소된다.
- [ ] **Step 3:** 브라우저 확인: `python3 -m http.server 8771 --bind 127.0.0.1`(저장소 루트) 후 `/20261116/ClaudeCode_Capstone_Overview.html`을 1440×900과 390×844에서 캡처해 가로 스크롤과 겹침이 없는지 본다.
- [ ] **Step 4:** 커밋 `docs(20261116): add the capstone overview`.

### Task 4: R1-A 고객 맞춤 서비스 (마이데이터)

**Files:**
- Create: `20261116/ClaudeCode_Capstone_R1A_HandsOnLab.html`
- Modify: `tools/capstone/check_capstone.py`, `tools/capstone/tests/test_check_capstone.py` (규칙 `r1a_restore` 추가)

**Interfaces:**
- Consumes: 마이데이터 키트 경로 `~/claude-lab/mydata/pseudo/`, `~/claude-lab/mydata/checkpoints/ch3/`(에이전트 3종, `segments.md`), `checkpoints/ch2/dlp-guard.sh`, 키트 다운로드 명령(마이데이터 랩 Ch3 TASK 00의 `aws s3 cp …mydata-kit.zip` 블록을 그대로 복사).
- Produces: 작업 폴더 `~/claude-lab/capstone/`(모든 트랙 공통, R2 Package가 이 폴더를 묶는다).

단계(`data-min` 합 ≤ 110): 00 준비와 복구(키트 없으면 받기, Ch3 체크포인트 복사), 01 업무 정하기(고객 한 명 상담 준비, superpowers brainstorm 주제는 "맡길 반복 업무와 막을 것"), 02 자기 agent 만들기(새 agent 1개 이상 + 체크포인트 agent 고치기, 읽기 전용 검토 agent 권장, 도구 권한 좁히기), 03 가드레일(개인정보 패턴과 `raw/` 접근 차단 훅, fail-closed), 04 막히는 것 확인(주민번호가 든 요청, `raw/` 읽기 시도), 05 R1 정리(CLAUDE.md 짧게, 쇼케이스 1 공유 문구).

- [ ] **Step 1: 실패 테스트.** `test_r1a_restore_requires_kit_download`: R1A 페이지의 00 단계 `<pre>`에 `~/claude-lab/mydata/pseudo` 존재 확인과 `mydata-kit.zip` 다운로드가 모두 없으면 `r1a_restore` 메시지.
- [ ] **Step 2:** `python3 -m unittest tools.capstone.tests.test_check_capstone -v` → 새 테스트 FAIL.
- [ ] **Step 3:** 규칙 구현 후 페이지 작성.
- [ ] **Step 4:** unittest 전부 PASS. `python3 tools/capstone/check_capstone.py | grep R1A` → 출력 없음.
- [ ] **Step 5:** 커밋 `docs(20261116): add capstone mission R1-A on MyData`.

### Task 5: R1-B 서울 부동산 시세 + MCP 골격

**Files:**
- Create: `20261116/capstone/seoul-realestate/server.py`, `sample.json`, `README.md`
- Create: `tools/capstone/tests/test_seoul_skeleton.py`
- Create: `20261116/ClaudeCode_Capstone_R1B_HandsOnLab.html`

**Interfaces:**
- Produces (`server.py`): FastMCP 서버 이름 `seoul-realestate`. 도구 `search_trades(gu: str, year_month: str, limit: int = 20) -> list[dict]`. 환경 변수 `SEOUL_API_KEY`가 없거나 `SEOUL_MOCK=1`이면 `sample.json`에서 같은 조건으로 걸러 돌려준다. 함수 `load_sample(path: Path) -> list[dict]`, `filter_rows(rows, gu, year_month, limit) -> list[dict]`는 MCP 없이도 임포트해 테스트할 수 있게 모듈 수준에 둔다. 키는 코드, 로그, 반환값 어디에도 찍지 않는다.
- `sample.json`: 합성 데이터 50행 이상, 자치구 5개 이상, 두 달 이상. 필드 이름은 서울 열린데이터광장의 부동산 실거래가 서비스 응답 필드를 따른다. **구현 전에 data.seoul.go.kr의 해당 서비스 명세에서 서비스 이름, 호출 URL 형식, 필드 이름을 확인해 README에 출처 URL과 함께 적는다.** 값은 지어낸 것이며 README와 파일 상단 메타에 "합성 데이터"라고 쓴다.

- [ ] **Step 1: 실패 테스트.**

```python
def test_mock_mode_without_key(self):
    env = {k: v for k, v in os.environ.items() if k != "SEOUL_API_KEY"}
    rows = run_search(env, gu="강남구", year_month=FIRST_MONTH, limit=5)   # server.search_trades를 직접 호출
    self.assertTrue(0 < len(rows) <= 5)
    self.assertTrue(all(r[GU_FIELD] == "강남구" for r in rows))

def test_key_never_returned(self):
    rows = run_search({"SEOUL_MOCK": "1", "SEOUL_API_KEY": "TESTKEY123"}, gu="강남구", year_month=FIRST_MONTH)
    self.assertNotIn("TESTKEY123", json.dumps(rows, ensure_ascii=False))
```

`GU_FIELD`, `FIRST_MONTH`는 확인한 필드 이름과 샘플 첫 달로 테스트 상단에 상수로 둔다. `mcp` 패키지가 없는 환경에서도 테스트가 돌도록 `server.py`는 `mcp` 임포트를 `if __name__ == "__main__":` 경로나 지연 임포트로 둔다.
- [ ] **Step 2:** `python3 -m unittest tools.capstone.tests.test_seoul_skeleton -v` → FAIL.
- [ ] **Step 3:** `server.py`, `sample.json`, README 작성. README: 키 발급 절차 링크, `claude mcp add` 등록 한 줄(실제 CLI로 확인한 형식), mock 실행법.
- [ ] **Step 4:** 테스트 PASS. 실제 키로 한 번 호출해 필드가 샘플과 같은지 확인한다(키가 없으면 PR 본문에 "실호출 미확인"을 적는다).
- [ ] **Step 5:** R1B 페이지 작성. 단계(합 ≤ 110): 00 키 발급 신청(기다리는 동안 다음 단계), 01 골격 받기(`curl -fsSL https://www.atomai.click/claude-code-workshop/20261116/capstone/seoul-realestate/server.py` 등 세 파일), mock으로 MCP 연결, 02 자기 agent 2개(시세 정리, 이상 거래), 03 가드레일(키가 파일이나 커밋에 들어가면 막는 훅, 호출 대상 `openapi.seoul.go.kr`만 허용), 04 막히는 것 확인(키를 파일에 쓰게 시켜 차단 확인), 05 키가 나오면 실호출로 전환, 06 R1 정리.
- [ ] **Step 6:** `python3 tools/capstone/check_capstone.py | grep -E 'R1B|secret_scan'` → 출력 없음. 커밋 `docs(20261116): add capstone mission R1-B with a Seoul open data MCP skeleton`.

### Task 6: R1-C 내가 고른 MCP

**Files:**
- Create: `20261116/ClaudeCode_Capstone_R1C_HandsOnLab.html`

추천 MCP 목록 5–8개(spec 11장 기준: 인증이 없거나 간단하고, 금융 업무와 맞닿는 것 위주). 각 항목은 제공처의 공식 문서 URL과 연결 명령을 실제로 확인한 것만 넣고, "추천일 뿐 허용 목록이 아니다, 고른 서버는 자기 plugin의 MCP 허용 목록 가드레일에 적는다"를 표 위에 둔다. 단계(합 ≤ 110): 00 고르기와 연결, 01 자기 agent 2개, 02 가드레일(MCP 허용 목록: `allowedMcpServers` 또는 권한 규칙, 외부 호출 범위), 03 막히는 것 확인(목록 밖 서버 연결 시도), 04 R1 정리.

- [ ] **Step 1:** 후보 조사. 각 서버를 이 환경과 같은 Claude Code 2.1.x에서 `claude mcp add`로 붙여 도구 목록이 뜨는지 확인한 결과를 표로 PR 본문에 남긴다.
- [ ] **Step 2:** 페이지 작성. 허용 목록 키 이름은 Ch4 랩 또는 공식 문서에서 확인한 것만 쓴다.
- [ ] **Step 3:** `python3 tools/capstone/check_capstone.py | grep R1C` → 출력 없음. 커밋 `docs(20261116): add capstone mission R1-C for a chosen MCP`.

### Task 7: R2 공통 단계와 R2-1, R2-2

**Files:**
- Create: `20261116/ClaudeCode_Capstone_R2_Package_HandsOnLab.html`, `ClaudeCode_Capstone_R2_1_HandsOnLab.html`, `ClaudeCode_Capstone_R2_2_HandsOnLab.html`

**Interfaces:**
- Consumes: `~/claude-lab/capstone/`(R1 산출물), Ch4 랩의 plugin 구조와 로컬 마켓플레이스 명령(`ClaudeCode_Ch4_HandsOnLab.html` TASK 01–02의 명령 형식을 그대로 따른다).
- Produces: plugin 폴더 `~/claude-lab/capstone/my-kit/`(이름은 교육생이 바꿈), 마켓플레이스 폴더 `~/claude-lab/capstone/marketplace/`, 새 설치 폴더 `~/claude-lab/capstone-try/`. R2 미션 페이지 셋이 이 경로를 쓴다.

Package 페이지 단계: 00 R1 산출물 확인(트랙 A는 Ch4 `asset-team-kit` 체크포인트를 바탕으로 써도 됨), 01 skill 하나 이상 만들기(반복 업무의 절차와 출력 형식), 02 plugin으로 묶기(agents, skills, MCP 설정, 훅, README, 버전), 03 로컬 마켓플레이스 등록, 04 새 폴더에서 설치해 가드레일까지 따라오는지 확인, 05 (선택) git 저장소로 올리기. 가드레일 강제력 문장: `<p data-note="managed-enforce">plugin 훅은 사용자가 끌 수 있습니다. 조직이 강제하려면 Ch2에서 본 managed 정책으로 내립니다.</p>`
R2-1, R2-2 페이지: 각각 "설치한 plugin으로" 업무 하나를 해 내고, 두 번째 업무에서 agent와 skill을 다시 짜지 않았음을 보이는 확인 단계를 둔다. 세 트랙(A/B/C) 각각의 예시 프롬프트를 짧게 담는다.

- [ ] **Step 1:** Package 페이지 작성. 명령은 Ch4 랩과 같은 형식으로, 새 폴더에서 실제로 설치되는지 한 번 돌려 본다.
- [ ] **Step 2:** R2-1, R2-2 작성.
- [ ] **Step 3:** `python3 tools/capstone/check_capstone.py | grep -E 'R2_(Package|1|2)|guardrail_note|time_budget'` → 출력 없음 (R2-3 없이도 Package + R2-1 + R2-2 합계가 180 이하).
- [ ] **Step 4:** 커밋 `docs(20261116): add the capstone R2 packaging step and missions R2-1, R2-2`.

### Task 8: R2-3 AgentCore 앱

**Files:**
- Create: `20261116/ClaudeCode_Capstone_R2_3_HandsOnLab.html`
- Modify: `tools/capstone/check_capstone.py`, test (규칙 `r2_3_cleanup`)

단계: 00 선택 미션 안내(고르면 두 개 중 하나로 센다), 01 같은 agent와 skill을 AgentCore에 올리기(aws-agents 플러그인의 실제 명령 흐름으로, 설치 후 `/plugin` 설명과 공식 문서로 확인한 것만), 02 Claude Code 밖에서 호출해 보기, 03 정리(만든 AgentCore 리소스 삭제 명령과 확인), 04 가드레일 예시: 지우거나 비용이 큰 AWS 작업은 확인을 받는 권한 `ask` 규칙.

- [ ] **Step 1: 실패 테스트** `test_r2_3_requires_cleanup_and_ask_rule`: `id="cleanup"` 절과 `"ask"` 권한 규칙 예시가 없으면 `r2_3_cleanup` 메시지.
- [ ] **Step 2:** FAIL 확인 → 규칙 구현 → 페이지 작성.
- [ ] **Step 3:** 실습 계정(Administrator)에서 배포와 정리를 한 번 리허설하고 리전, 소요 시간, 남는 리소스 여부를 PR 본문에 적는다. 리허설을 못 하면 페이지 상단에 "리허설 전" 배지를 두지 말고 PR을 draft로 둔다.
- [ ] **Step 4:** unittest PASS, `check_capstone.py` 전체 exit 0 이전 단계까지 R2_3 관련 메시지 없음. 커밋 `docs(20261116): add capstone mission R2-3 on AgentCore`.

### Task 9: 포털, eDM, 기존 미션 아카이브

**Files:**
- Modify: `20261116/index.html`(`#capstones` 절, Day 흐름 칩 두 개, 히어로 구성 문구), `20261116/eDM.html`(Capstone R1, R2 카드), `20261116/eDM.txt`, `20261116/eDM-notes.md`, 기존 11개 페이지(상단 아카이브 안내만)

- [ ] **Step 1:** `#capstones` 절을 새로 쓴다: SETUP 카드, 개요 카드, R1 미션 카드 3장, R2 공통 카드 + 미션 카드 3장(기존 `.cards`/`.card` 마크업 재사용). 기존 7+4개 카드는 `<section id="capstone-archive">` "예전 예시" 접힘 영역으로 옮긴다. Day 흐름 칩의 "Capstone R1, 게임/미술관/지진 워치", "Capstone R2, 증시/유튜브/뉴스룸 렌즈"를 "Capstone R1, 내 agents와 가드레일", "Capstone R2, 내 plugin 배포와 재사용"으로.
- [ ] **Step 2:** eDM의 R1, R2 카드 문구를 spec 3장 표의 "손에 남는 것"으로, 링크를 Overview로. eDM.txt를 같은 문구로. eDM-notes.md에 캡스톤 재설계 한 단락(영문)과 새 페이지 목록.
- [ ] **Step 3:** 기존 11개 페이지 `<body>` 직후에 아카이브 안내(공통 마크업 계약)를 넣는다. 다른 내용은 바꾸지 않는다.
- [ ] **Step 4:** Run: `python3 tools/capstone/check_capstone.py` → Expected: exit 0, 출력 없음. `python3 -m unittest discover -s tools -t .` → 전부 PASS(마이데이터 테스트 포함). `git diff --check`.
- [ ] **Step 5:** 브라우저로 포털 캡스톤 절과 eDM 일정 카드를 데스크톱과 모바일 폭에서 확인.
- [ ] **Step 6:** 커밋 `docs(20261116): point the portal and invitation at the new capstone`.

### Task 10: 인트로 영상 한 줄

**Files:**
- Modify: `../fsi-workshop-video/src/scenes.tsx`(CapstoneScene 화면 문구), `../fsi-workshop-video/narration/script.json`(키 `capstone`), 재생성 `public/vo/capstone.mp3`, `src/vo-manifest.json`
- Modify: `20261116/media/intro-90s.mp4`, `20261116/media/intro-90s.ko.vtt`(캡스톤 큐 한 개)

- [ ] **Step 1:** `script.json`의 `capstone`을 "캡스톤에서는 나만의 에이전트와 가드레일을 만들고, 플러그인으로 묶어 다시 씁니다."로 바꾸고 `npm run narration`(Polly, 기존 계정과 음성)으로 그 클립만 다시 만든다. 새 클립 길이가 장면 길이(360프레임, 12초, VO_DELAY 15프레임)를 넘지 않는지 `vo-manifest.json`으로 확인한다.
- [ ] **Step 2:** CapstoneScene 화면의 "자유 주제", "CloudFront", "Slack 공유" 문구를 R1, R2 구조로 바꾸고 `npx remotion still`로 해당 프레임을 캡처해 확인한다.
- [ ] **Step 3:** `npm run render` 후 `eDM-notes.md` "Intro Video" 절의 ffmpeg 명령으로 `media/intro-90s.mp4`를 재인코딩. 길이가 93초 ±1초인지 `ffprobe`로 확인. vtt의 캡스톤 큐 문장을 바꾸고 시작 시각은 그대로(새 클립이 더 길면 끝 시각만 늘린다).
- [ ] **Step 4:** 커밋 `docs(20261116): update the intro video capstone scene`.

### Task 11: 리뷰와 병합

- [ ] **Step 1:** `python3 tools/capstone/check_capstone.py` exit 0, `python3 -m unittest discover -s tools -t .` PASS, `git diff --check` clean.
- [ ] **Step 2:** 브랜치 푸시, PR 작성(본문에 Task 2의 플러그인 확인 결과, Task 5의 실호출 여부, Task 6의 MCP 확인 표, Task 8의 리허설 결과).
- [ ] **Step 3:** content-review-agent를 최신 HEAD에 대해 돌려 85% 이상 PASS. Critical, Major는 고친 뒤 다시 리뷰.
- [ ] **Step 4:** `gh pr merge --merge --match-head-commit <reviewed SHA>`, Pages 배포 성공과 새 Overview 페이지 200 응답 확인.
