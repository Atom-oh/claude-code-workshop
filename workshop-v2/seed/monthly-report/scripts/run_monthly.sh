#!/usr/bin/env bash
# 예약 실행용: Skill로 보고서를 만들고, 모델의 말이 아니라 대조 스크립트로 다시 판정한다.
# 사용: scripts/run_monthly.sh 2026-10        종료 코드 0이면 통과, 아니면 사람이 확인해야 한다.
set -uo pipefail
MONTH="${1:?점검월(YYYY-MM)을 인자로 주세요}"
cd "$(dirname "$0")/.."
rm -f output/월간보고.xlsx output/검증실패.txt

claude -p "/monthly-report $MONTH" \
  --model "${REPORT_MODEL:-sonnet}" --effort low --permission-mode acceptEdits \
  --allowedTools "Read" "Write" "Edit" "Bash(python3 *)" \
  --permission-prompts none --max-turns 25 --max-budget-usd "${REPORT_BUDGET:-1.00}" \
  --output-format json > output/run.json 2> output/run.err
RC=$?
echo "claude 종료 코드=$RC, 비용=$(jq -r '.total_cost_usd // "?"' output/run.json 2>/dev/null) USD"

# 모델이 '완료'라고 말했는지와 무관하게, 결과 파일을 결정적 스크립트로 다시 검사한다.
if [ -f output/월간보고.xlsx ] && python3 scripts/reconcile.py output/월간보고.xlsx; then
  echo "통과: output/월간보고.xlsx"
  exit 0
fi
echo "실패: 보고서가 없거나 대조를 통과하지 못했습니다. 사람이 확인하세요." >&2
exit 1
