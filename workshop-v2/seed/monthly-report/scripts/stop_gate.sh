#!/usr/bin/env bash
# Stop 훅: 보고서가 있으면 대조 스크립트로 검증한다.
# 불일치면 exit 2로 Claude가 멈추지 못하게 하고, 3번 고쳐도 안 되면 사람이 보도록 표시 파일을 남긴다.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
REPORT="output/월간보고.xlsx"
COUNT_FILE=".claude/.gate_count"
[ -f "$REPORT" ] || exit 0

RECONCILE="${RECONCILE:-scripts/reconcile.py}"   # 관리형 배포에서는 root 소유 경로를 지정
msg=$(python3 "$RECONCILE" "$REPORT" 2>&1); rc=$?
if [ "$rc" -eq 0 ]; then
  rm -f "$COUNT_FILE" "output/검증실패.txt"
  exit 0
fi

n=$(( $(cat "$COUNT_FILE" 2>/dev/null || echo 0) + 1 ))
echo "$n" > "$COUNT_FILE"
if [ "$n" -gt 3 ]; then
  printf '자동 검증 실패: 3회 수정 후에도 대조가 통과하지 않았습니다. 사람이 확인하세요.\n%s\n' "$msg" > "output/검증실패.txt"
  exit 0
fi
printf '대조 스크립트가 불일치를 찾았습니다. 보고서를 고친 뒤 다시 완료하세요 (%s/3).\n%s\n' "$n" "$msg" >&2
exit 2
