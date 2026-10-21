#!/usr/bin/env python3
"""연습용 OTLP/HTTP(JSON) 수신기. 표준 라이브러리만 쓴다. 127.0.0.1에서만 받는다.
Claude Code가 보내는 claude_code.cost.usage 지표를 team.id, model, query_source별로 합산해 출력한다.
사용: python3 otlp_sink.py [포트]   (기본 14318)
"""
import json, sys
from collections import defaultdict
from http.server import BaseHTTPRequestHandler, HTTPServer

TOTAL = defaultdict(float)


def attr_map(attrs):
    out = {}
    for a in attrs or []:
        v = a.get("value", {})
        out[a["key"]] = next(iter(v.values())) if v else None
    return out


class H(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        try:
            data = json.loads(body)
        except Exception:
            self.send_response(415); self.end_headers(); return
        if self.path.endswith("/v1/metrics"):
            for rm in data.get("resourceMetrics", []):
                res = attr_map(rm.get("resource", {}).get("attributes"))
                for sm in rm.get("scopeMetrics", []):
                    for m in sm.get("metrics", []):
                        if m.get("name") != "claude_code.cost.usage":
                            continue
                        for dp in (m.get("sum") or m.get("gauge") or {}).get("dataPoints", []):
                            a = {**res, **attr_map(dp.get("attributes"))}
                            val = dp.get("asDouble", dp.get("asInt", 0))
                            key = (a.get("team.id", "-"), a.get("model", "-"), a.get("query_source", "-"))
                            TOTAL[key] = max(TOTAL[key], float(val))  # 누적(cumulative) 값이므로 최댓값을 쓴다
            print("\n팀 | 모델 | 호출 유형 | 누적 비용(USD)")
            for (t, mo, q), v in sorted(TOTAL.items()):
                print(f"{t} | {mo} | {q} | {v:.4f}", flush=True)
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(b"{}")

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 14318
    print(f"OTLP 수신 대기: http://127.0.0.1:{port}/v1/metrics", flush=True)
    HTTPServer(("127.0.0.1", port), H).serve_forever()
