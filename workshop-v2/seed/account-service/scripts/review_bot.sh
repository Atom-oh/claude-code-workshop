#!/usr/bin/env bash
# PR 리뷰 봇: diff를 읽기 전용으로 검토하고 JSON으로 결과를 낸다.
# high 지적이 하나라도 있으면 종료 코드 1을 반환해 CI를 막는다.
# 사용: scripts/review_bot.sh [기준 브랜치]   (기본 origin/main)
set -euo pipefail
BASE="${1:-origin/main}"
DIFF=$(git diff "$BASE"...HEAD)
[ -n "$DIFF" ] || { echo "변경 없음"; exit 0; }

RESULT=$(printf '%s' "$DIFF" | claude -p "이 diff를 코드 리뷰해 줘. 금액 계산 정확성, null 처리, 테스트 누락을 우선 본다. 변경된 줄에 대한 지적만 한다." \
  --model "${REVIEW_MODEL:-sonnet}" --tools "Read,Grep,Glob" --disallowedTools "mcp__*" \
  --permission-prompts none --max-turns 6 --max-budget-usd "${REVIEW_BUDGET:-0.50}" \
  --json-schema "$(cat "$(dirname "$0")/review_schema.json")" --output-format json)

# structured_output이 없으면 실패로 취급한다(검증 없이 통과시키지 않는다).
echo "$RESULT" | jq -e '.structured_output' >/dev/null || { echo "리뷰 결과 형식 오류" >&2; exit 2; }
echo "$RESULT" | jq -r '.structured_output | "요약: \(.summary)", (.findings[] | "[\(.severity)] \(.file):\(.line // "-") \(.message)")'
echo "비용: $(echo "$RESULT" | jq -r '.total_cost_usd') USD" >&2

HIGH=$(echo "$RESULT" | jq '[.structured_output.findings[] | select(.severity=="high")] | length')
[ "$HIGH" -eq 0 ] || { echo "high 지적 ${HIGH}건: 머지 차단" >&2; exit 1; }
