#!/bin/bash
INPUT=$(cat)
command -v jq >/dev/null || { echo "DLP: 검사기 오류(jq 없음) - 안전을 위해 차단" >&2; exit 2; }
TEXT=$(echo "$INPUT" | jq -r '.prompt // (.tool_input | tostring)') || { echo "DLP: 입력 해석 실패 - 차단" >&2; exit 2; }

PAT='(^|[^0-9])([0-9]{6}-[1-4][0-9]{6}|[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}|01[016789]-[0-9]{3,4}-[0-9]{4}|[0-9]{3}-[0-9]{2,6}-[0-9]{5,7})([^0-9]|$)|AKIA[0-9A-Z]{16}'
echo "$TEXT" | grep -Eq "$PAT"; RC=$?
[ "$RC" -eq 1 ] && exit 0      # 1 = 패턴 없음 → 통과
if [ "$RC" -eq 0 ]; then
  echo "DLP: 민감정보 패턴이 감지되어 차단했습니다" >&2
else
  echo "DLP: 검사기 오류(grep 종료 코드 $RC) - 안전을 위해 차단" >&2
fi
exit 2
