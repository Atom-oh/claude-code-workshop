# 하나카드 차지백 AI 워크숍

**코딩 없이**, 자연어(한국어)로 Claude Code에게 시켜서 **차지백 재반박 도우미 서비스**를 설치부터 AWS 배포까지 직접 만들어 보는 1-Day 핸즈온입니다.

## 시작하기

```bash
git clone git@github.com:Atom-oh/claude-code-workshop.git
cd claude-code-workshop
```

1. **사전준비(D-1):** [`workshop/labs/PREWORK.md`](workshop/labs/PREWORK.md) — Claude Code 설치 + Amazon Bedrock 연결
2. **당일 진행:** [`workshop/labs/README.md`](workshop/labs/README.md) 의 Lab 0 → 5 순서대로
3. **작업 폴더:** 실습은 `cd workshop/mvp` 에서 `claude` 를 실행해 진행합니다 (프로젝트 규칙 `CLAUDE.md`·로컬 스킬·서브에이전트 자동 로드)

## 구성

```
workshop/
├── labs/     랩 가이드 (PREWORK + Lab 0~5)
└── mvp/      참가자 작업 폴더 (스타터)
    ├── .claude/      chargeback-1cb 스킬 · 서브에이전트
    ├── CLAUDE.md     프로젝트 규칙
    ├── rules/        VISA 규칙 (요약)
    └── sample-data/  익명 샘플 케이스
```

> **데이터 원칙:** 실제 고객 PII(실명·주민번호·실 카드번호)는 입력 금지. 익명/마스킹 데이터만 사용합니다. 실(비식별화) 케이스는 저장소에 포함되지 않으며 워크숍 환경에 강사가 직접 배치합니다.
