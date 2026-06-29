# 하나카드 차지백 AI 워크숍 — 핸즈온 랩 (참가자용)

> **코딩 없이**, 자연어(한국어)로 Claude Code에게 시켜서 **1CB 이의신청 도우미 "서비스"를 설치부터 AWS 배포까지** 직접 만들어 보는 1-Day 핸즈온입니다.
> (이 워크숍은 **OB(발급사·1CB) — 하나카드가 자사 카드홀더를 대리해 처음 청구(1CB)를 개시**하는 업무만 다룹니다.)
> 개념을 익히고 → 차지백을 이해하는 **스킬**을 만들고 → 만들 서비스를 **brainstorming**으로 설계하고 → **Next.js 화면 + Amazon Bedrock AgentCore 배포**까지 갑니다.

---

## 워크숍 정보

| 항목 | 내용 |
|------|------|
| **일시** | **2026-06-30 (화) 10:00 – 17:00** (점심 12:00 – 13:00) |
| **장소** | **AWS 센터필드 8층 08.301** |
| **WiFi** | `guest` / 비밀번호: `〔현장에서 공지〕` |
| **대상** | 차지백(분쟁처리) 현업 실무자 6명 — 개발·AI 미경험 환영 |
| **도구** | Claude Code on Amazon Bedrock (서울 리전, `ap-northeast-2`) |
| **당일 산출물** | 동작하는 **1CB 이의신청 도우미 서비스** — Next.js 화면 + **AgentCore에 배포된 에이전트** |

### 오늘 만드는 것

**1CB 이의신청 도우미**입니다. **하나카드가 자사 카드홀더를 대리해 처음 청구(1CB, First Chargeback)를 개시**하는 업무를 돕습니다. 카드홀더가 제출한 자료를 넣으면 → 사유코드·발급사 제출요건을 안내하고 → **1CB 카드홀더레터(영문) 초안**을 만들어 줍니다. 그 "두뇌"는 우리가 직접 만드는 **차지백 스킬**(Lab 3)이고, 이를 **AgentCore 에이전트**로 배포해 **Next.js 웹**에서 씁니다.

```
[카드홀더 제출 자료] → Next.js 화면 → (서버) → AgentCore 에이전트(차지백 스킬 + Claude Sonnet) → 1CB 카드홀더레터 초안
```

---

## 진행 원칙 (하루 종일 지킵니다)

1. **사람이 최종 결정 (HITL)** — AI는 초안·후보·설계만 만듭니다. 사유코드 선택·서류 승인·배포 결정은 **여러분**이 합니다. 단계마다 멈춰 읽고 고친 뒤 다음으로.
2. **익명/마스킹 데이터만** — 실제 고객 PII(실명·주민번호·실 카드번호)는 입력 금지. 카드번호는 `1111-1111-1111-1111` 같은 마스킹본만.
3. **코딩이 아니라 자연어로** — 슬래시(`/`) 명령 몇 개 외엔, 그냥 한국어 문장으로 시킵니다. Claude Code가 스킬·코드·배포를 만들어 주고, **여러분은 업무 지식으로 검토**합니다.

> **작업 폴더:** 실습은 **`workshop/mvp/`** 에서 `claude` 를 실행해 진행합니다 (프로젝트 규칙 `CLAUDE.md` 자동 로드).

---

## 사전준비 (D-1까지 완료)

- **사전준비 안내서(마크다운):** [`PREWORK.md`](./PREWORK.md) — Claude Code 설치(**macOS + Windows**) + Amazon Bedrock 연결 (맥북 권장)
- **10:00 시점 전제:** 환경 준비 완료. **Lab 0은 점검만** 합니다.
- 배포(Lab 5)를 위해 추가로 필요: **Node.js 20+**, **Python 3.10+** (브로셔/안내서에 포함).

---

## 랩 목차

| 랩 | 제목 | 시간 | 한 줄 목표 | 파일 |
|----|------|------|-----------|------|
| **Lab 0** | 환경 확인 | 10:00–10:15 | `claude` 실행 + `/status` Bedrock 확인 | [`00-environment.md`](./00-environment.md) |
| **Lab 1** | 스킬·플러그인 설치 | 10:15–10:35 | `/plugin`으로 플러그인 설치 + 프로젝트 스킬·에이전트 인식 | [`01-skills-plugins.md`](./01-skills-plugins.md) |
| **Lab 2** | 핵심 개념 — 스킬·에이전트·Harness·MCP | 10:35–11:05 | 4가지 개념을 차지백/배포와 연결해 이해 | [`02-concepts.md`](./02-concepts.md) |
| **Lab 3** | 차지백 이해 스킬 만들기 | 11:05–12:00 | `skill-creator`로 OB(1CB) 도메인 스킬 제작 | [`03-build-chargeback-skill.md`](./03-build-chargeback-skill.md) |
| **Lab 4** | 서비스 정의 & 배포 준비 (brainstorming) | 13:00–13:40 | 만들 서비스 설계 + 배포 프롬프트 정리 | [`04-brainstorm-and-deploy.md`](./04-brainstorm-and-deploy.md) |
| **Lab 5** | 프론트엔드(Next.js) & AgentCore 배포 | 13:40–16:30 | 디자인→Next.js→AgentCore 배포→연결 | [`05-frontend-and-agentcore.md`](./05-frontend-and-agentcore.md) |
| 마무리 | end-to-end 데모 · 정리 | 16:30–17:00 | 설치~배포 데모 + `agentcore remove all` | (Lab 5 마지막) |

### 사용하는 도구·플러그인

- **Claude Code on Amazon Bedrock** — 워크숍 내내 쓰는 harness
- **superpowers:brainstorming** — 무엇을 만들지 설계 (Lab 4)
- **skill-creator** — 차지백 스킬 제작 (Lab 3)
- **frontend-design** — 화면 디자인 (Lab 5)
- **agentcore-creator / `@aws/agentcore` CLI** — 스킬을 AgentCore 에이전트로 변환·배포 (Lab 5)

> 💡 **막힐 때:** 옆 페어나 SA에게 손을 드세요. 혼자 5분 이상 헤매지 않기. AI에게 `"방금 뭐 했고 지금 결과가 뭔지 한국어로 알려줘"` 라고 물으면 현재 상태를 확인할 수 있습니다.

---

👉 시작: **[Lab 0 — 환경 확인](./00-environment.md)**
