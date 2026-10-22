#!/usr/bin/env python3
"""같은 작업을 모델별로 두 번씩 실행해 비용과 토큰 구성을 비교한다. 모델 호출이 실제로 일어난다.
사용: python3 scripts/cost_compare.py [--safe-mode]    (--safe-mode: 플러그인·CLAUDE.md 등을 끄고 깨끗한 기준으로 측정)
출력의 비용은 Claude Code의 클라이언트 측 추정치이며 실제 청구액과 다를 수 있다."""
import json, subprocess, sys

PROMPT = "data/gangnam.csv의 판매건수 합계를 Python으로 계산해서 숫자만 답해."
extra = ["--safe-mode"] if "--safe-mode" in sys.argv else []
print("모델 | 회차 | 비용(USD) | 캐시 생성 토큰 | 캐시 읽기 토큰 | 출력 토큰 | 턴")
for model in ["haiku", "sonnet", "opus"]:
    for n in (1, 2):
        p = subprocess.run(
            ["claude", "-p", PROMPT, *extra, "--model", model, "--effort", "low", "--permission-mode", "acceptEdits",
             "--allowedTools", "Bash(python3:*)", "Read", "--max-budget-usd", "1.5", "--output-format", "json"],
            capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=300)
        try:
            d = json.loads(p.stdout); u = next(iter(d["modelUsage"].values()))
        except Exception:
            print(f"{model} | {n} | 실패: {p.stderr.strip()[:100]}"); continue
        print(f"{model} | {n} | {u['costUSD']:.4f} | {u['cacheCreationInputTokens']} | {u['cacheReadInputTokens']} | {u['outputTokens']} | {d['num_turns']}", flush=True)
