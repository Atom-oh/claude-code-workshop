#!/usr/bin/env python3
"""연습용 감사 훅. PreToolUse 이벤트마다 한 줄(JSONL)을 남긴다. 값 전체가 아니라 요약만 기록한다.
훅은 stdin으로 JSON을 받는다. 이 스크립트는 아무것도 막지 않는다(항상 exit 0)."""
import json, os, sys, time

AUDIT = os.environ.get("AUDIT_LOG", os.path.expanduser("~/claude-audit.jsonl"))
try:
    ev = json.load(sys.stdin)
except Exception:
    sys.exit(0)
inp = ev.get("tool_input") or {}
summary = inp.get("command") or inp.get("file_path") or inp.get("pattern") or inp.get("url") or ""
rec = {
    "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
    "session": ev.get("session_id"),
    "event": ev.get("hook_event_name"),
    "tool": ev.get("tool_name"),
    "target": str(summary)[:160],
    "cwd": ev.get("cwd"),
}
with open(AUDIT, "a", encoding="utf-8") as f:
    f.write(json.dumps(rec, ensure_ascii=False) + "\n")
sys.exit(0)
