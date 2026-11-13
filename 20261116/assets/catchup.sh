#!/bin/bash
# catchup <chapter> -- put the lab PC in the state a chapter's TASK 00 expects,
# so a learner whose earlier lab failed can start the next one.
#
#   catchup ch4        (also: 4, ch2-lab2, ch2-lab1, ch1 ... ch6)
#
# What it does, in order:
#   1. fetch the MyData kit if ~/claude-lab/mydata/pseudo is missing
#   2. clear managed policy (managed-settings.json = {}, no drop-ins)
#   3. drop Ch2 Lab 1's raw-read rules from ~/.claude/settings.json, then use_bedrock_direct
#   4. move the chapter's own folder aside to ~/claude-lab/.catchup-backup/ (nothing is deleted)
#   5. chapters up to Ch4: remove the asset-team-kit plugin and fsi-local marketplace
#   6. fill what the chapter reads from earlier chapters with the kit's reference copies
#      (ch4: Ch3 agents, segments.md, DLP hook; ch5: asset-team-kit plugin)
# Then the learner runs the chapter's TASK 00 block as usual.
#
# Source of truth: 20261116/assets/catchup.sh in the claude-code-workshop repo, published at
#   https://www.atomai.click/claude-code-workshop/20261116/assets/catchup.sh
# Once the Workshop Studio stack installs it as ~/.local/bin/catchup, `catchup ch4` works directly.
# Until then (or on any PC without it):
#   bash <(curl -fsSL https://www.atomai.click/claude-code-workshop/20261116/assets/catchup.sh) ch4
# Every sudo, claude and helper call reads </dev/null, so even `curl ... | bash -s ch4` (script on
# stdin) cannot have its remaining lines swallowed by a command that reads stdin.
# Test hooks: CATCHUP_ETC and CATCHUP_DLP override /etc/claude-code and /opt/dlp.
set -euo pipefail

L="$HOME/claude-lab"
K="$L/mydata"
ETC="${CATCHUP_ETC:-/etc/claude-code}"
DLP="${CATCHUP_DLP:-/opt/dlp}"
KIT="${WS_KIT:-s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip}"

usage() {
  echo "사용법: catchup <장>   예: catchup ch4" >&2
  echo "  장: ch1, ch2 (= ch2-lab1), ch2-lab2, ch3, ch4, ch5, ch6 (숫자만 써도 됩니다)" >&2
  exit 2
}

[ $# -eq 1 ] || usage
case "$1" in
  1|ch1) T=ch1; DIR=ch1 ;;
  2|ch2|ch2-lab1) T=ch2; DIR=ch2 ;;
  ch2-lab2) T=ch2-lab2; DIR=ch2 ;;
  3|ch3) T=ch3; DIR=ch3 ;;
  4|ch4) T=ch4; DIR=ch4 ;;
  5|ch5) T=ch5; DIR=ch5 ;;
  6|ch6) T=ch6; DIR=ch6 ;;
  -h|--help) usage ;;
  *) echo "[catchup] 알 수 없는 장: $1" >&2; usage ;;
esac
N=${T#ch}; N=${N%%-*}

say() { echo "[catchup] $*"; }
BK="$L/.catchup-backup"
stamp() { date +%Y%m%d-%H%M%S; }
# plugin/marketplace listings are captured first, so pipefail never sees grep -q close the pipe
plugins() { claude plugin list 2>/dev/null </dev/null || true; }
markets() { claude plugin marketplace list 2>/dev/null </dev/null || true; }
has() { case "$1" in *"$2"*) return 0 ;; *) return 1 ;; esac; }

# 1. kit
if [ ! -d "$K/pseudo" ]; then
  say "키트를 내려받습니다"
  aws s3 cp "$KIT" /tmp/mydata-kit.zip --only-show-errors </dev/null
  mkdir -p "$K" && unzip -qo /tmp/mydata-kit.zip -d "$K"
fi
[ -d "$K/checkpoints" ] || { say "키트에 checkpoints가 없습니다: $K" >&2; exit 1; }

# 2. managed policy (anything non-empty is copied to the backup folder first)
MS="$ETC/managed-settings.json"
if { sudo test -e "$MS" </dev/null && ! sudo jq -e 'del(.forceLoginMethod, .forceLoginGatewayUrl) == {}' "$MS" >/dev/null 2>&1 </dev/null; } \
   || ls "$ETC"/managed-settings.d/*.json >/dev/null 2>&1; then
  P="$BK/policy-$(stamp)"
  mkdir -p "$P"
  sudo cp "$MS" "$P/" 2>/dev/null </dev/null || true
  sudo cp "$ETC"/managed-settings.d/*.json "$P/" 2>/dev/null </dev/null || true
  sudo chown -R "$(id -u)" "$P" 2>/dev/null </dev/null || true
  if [ -n "$(ls -A "$P" 2>/dev/null)" ]; then
    say "남아 있던 정책을 복사해 두었습니다: $P"
  else
    rmdir "$P" 2>/dev/null || true
    say "경고: 남아 있던 정책을 읽지 못해 백업하지 못했습니다" >&2
  fi
fi
echo '{}' | sudo tee "$MS" >/dev/null
sudo rm -f "$ETC"/managed-settings.d/*.json </dev/null
say "정책 초기화: managed-settings.json = {}, managed-settings.d 조각 삭제"

# 3. user settings, same scope as Ch3 Step 1: Ch2 Lab 1 TASK 03's raw-read rules,
#    Ch2 Lab 2's permissions.ask (git push) and autoMode
S="$HOME/.claude/settings.json"
if [ -s "$S" ] && jq -e 'type == "object"' "$S" >/dev/null 2>&1; then
  RAW='claude-lab/(mydata|ch2)/raw'
  if jq -e --arg r "$RAW" '([(.permissions // {}) | (.allow, .deny, .ask) | (. // [])[] | strings | select(test($r))] | length > 0)
                          or (.permissions.ask != null) or (.autoMode != null)' "$S" >/dev/null 2>&1; then
    cp "$S" "$S.before-catchup"
    jq --arg r "$RAW" '
      del(.autoMode)
      | if (.permissions | type) == "object" then del(.permissions.ask) else . end
      | if .permissions then
        .permissions |= (with_entries(if (.key == "allow" or .key == "deny" or .key == "ask")
                                       then .value |= ((. // []) | map(select(type != "string" or (test($r) | not))))
                                       else . end)
                         | with_entries(select(.value != [])))
        | if .permissions == {} then del(.permissions) else . end
      else . end' "$S.before-catchup" > "$S.tmp"
    mv "$S.tmp" "$S"
    say "사용자 설정에서 Ch2 Lab 1의 raw 읽기 규칙과 Ch2 Lab 2의 ask·autoMode를 지웠습니다 (이전 파일: $S.before-catchup)"
  fi
fi
use_bedrock_direct >/dev/null </dev/null
say "기본 모드(use_bedrock_direct)로 맞췄습니다"

# 4. the chapter's own folder
if [ -e "$L/$DIR" ]; then
  B="$BK/$DIR-$(stamp)"
  mkdir -p "$BK"
  mv "$L/$DIR" "$B"
  say "작업 폴더 ~/claude-lab/$DIR → $B (지우지 않고 옮김)"
fi

# 5. Ch4 has not installed its plugin yet at the start of Ch2-Ch4
if [ "$N" -le 4 ] && [ "$N" -ge 2 ]; then
  if has "$(plugins)" asset-team-kit; then
    if claude plugin uninstall asset-team-kit@fsi-local >/dev/null 2>&1 </dev/null; then
      say "Ch4에서 설치하는 asset-team-kit 플러그인을 제거했습니다 (이 장을 시작할 때는 없는 상태)"
    else
      say "경고: asset-team-kit 제거에 실패했습니다. claude plugin list로 범위(scope)를 확인하고 직접 제거하세요" >&2
    fi
  fi
  if has "$(markets)" fsi-local; then
    if claude plugin marketplace remove fsi-local >/dev/null 2>&1 </dev/null; then
      say "fsi-local 마켓플레이스 등록을 지웠습니다"
    else
      say "경고: fsi-local 마켓플레이스를 지우지 못했습니다" >&2
    fi
  fi
fi

# 6. what the chapter reads from earlier chapters
CP="$K/checkpoints"
if [ "$T" = ch4 ]; then
  mkdir -p "$L/ch3/.claude/agents"
  for a in spending-analyst portfolio-analyst risk-reviewer; do
    [ -f "$L/ch3/.claude/agents/$a.md" ] || { cp "$CP/ch3/agents/$a.md" "$L/ch3/.claude/agents/"; say "Ch3 에이전트 기준본: $a"; }
  done
  RR="$L/ch3/.claude/agents/risk-reviewer.md"
  if [ -f "$RR.bak" ]; then
    mv "$RR.bak" "$RR"
    say "Ch3 TASK 02의 원복(mv .bak)을 대신했습니다"
  fi
  # checked after the restore too: a sed run twice leaves Write in the .bak itself
  if ! grep -qx 'tools: Read, Grep, Glob' "$RR"; then
    mkdir -p "$BK" && cp "$RR" "$BK/risk-reviewer-$(stamp).md"
    cp "$CP/ch3/agents/risk-reviewer.md" "$RR"
    say "risk-reviewer의 tools가 읽기 전용이 아니어서 기준본으로 바꿨습니다 (이전 파일은 $BK)"
  else
    say "risk-reviewer: 읽기 전용(tools: Read, Grep, Glob) 확인"
  fi
  [ -f "$L/ch3/segments.md" ] || { cp "$CP/ch3/segments.md" "$L/ch3/"; say "Ch3 segments.md 기준본"; }
  ln -sfn "$K/pseudo" "$L/ch3/pseudo"   # Ch4 TASK 06 opens Claude in ch3 and reads pseudo/
  if ! cmp -s "$CP/ch2/dlp-guard.sh" "$DLP/dlp-guard.sh" 2>/dev/null; then
    sudo mkdir -p "$DLP" </dev/null && sudo install -m 755 "$CP/ch2/dlp-guard.sh" "$DLP/dlp-guard.sh" </dev/null
    say "DLP 훅 기준본을 설치했습니다: $DLP/dlp-guard.sh"
  fi
fi
if [ "$T" = ch5 ] && ! has "$(plugins)" asset-team-kit; then
  M="$L/ch4/marketplace"
  mkdir -p "$M/.claude-plugin" "$M/plugins"
  # not installed means Ch4 did not finish: a half-built plugin folder is moved aside, not installed
  if [ -e "$M/plugins/asset-team-kit" ]; then
    mkdir -p "$BK"
    mv "$M/plugins/asset-team-kit" "$BK/asset-team-kit-$(stamp)"
    say "Ch4에서 만들다 만 asset-team-kit 폴더를 옮겼습니다: $BK"
  fi
  cp -r "$CP/ch4/asset-team-kit" "$M/plugins/"
  cat > "$M/.claude-plugin/marketplace.json" << 'EOF'
{
  "name": "fsi-local",
  "owner": { "name": "Platform Team" },
  "plugins": [
    { "name": "asset-team-kit", "source": "./plugins/asset-team-kit", "description": "고객자산 분석팀 킷" }
  ]
}
EOF
  claude plugin marketplace add "$M" >/dev/null 2>&1 </dev/null || true
  claude plugin install asset-team-kit@fsi-local >/dev/null </dev/null
  P="$(plugins)"
  if has "$P" asset-team-kit && ! has "$P" "failed to load"; then
    say "Ch4 asset-team-kit 기준본을 설치했습니다"
  else
    say "경고: asset-team-kit 설치를 확인하지 못했습니다. claude plugin list를 확인하세요" >&2
  fi
fi

case "$T" in
  ch2) LAB="Ch2 Lab 1" ;;
  ch2-lab2) LAB="Ch2 Lab 2" ;;
  *) LAB="Ch$N" ;;
esac
say "준비 끝. 실행 중인 claude는 모두 종료하고, $LAB 랩의 TASK 00 블록부터 실행하세요."
