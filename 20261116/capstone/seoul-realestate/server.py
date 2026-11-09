"""seoul-realestate: 서울시 부동산 실거래가 정보를 감싸는 MCP 서버 골격 (캡스톤 R1-B).

- 데이터: 서울 열린데이터광장 "서울시 부동산 실거래가 정보" (서비스 tbLnOpendataRtmsV)
  https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do
- 키: 환경 변수 SEOUL_API_KEY 로만 받는다. 코드, 로그, 반환값 어디에도 찍지 않는다.
- mock 모드: SEOUL_API_KEY 가 없거나 SEOUL_MOCK=1 이면 옆의 sample.json(합성 데이터)을 쓴다.
- 호출 대상: openapi.seoul.go.kr 하나뿐이다.

실행: python3 server.py  (stdio). 테스트에서 임포트할 수 있도록 mcp 패키지는 main() 안에서만 임포트한다.
"""
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

SERVER_NAME = "seoul-realestate"
SERVICE = "tbLnOpendataRtmsV"
BASE_URL = "http://openapi.seoul.go.kr:8088"
SAMPLE_PATH = Path(__file__).with_name("sample.json")
PAGE_SIZE = 1000   # 명세: 한 번에 최대 1000건
MAX_PAGES = 5      # 도구 호출 한 번에 API를 부르는 최대 횟수
TIMEOUT = 10       # 초
SAMPLE_KEY = "sample"  # 열린데이터광장의 공개 시험 키. 한 번에 5건까지만 준다 (ERROR-335)
SAMPLE_KEY_ROWS = 5


def load_sample(path: Path) -> list[dict]:
    """sample.json 을 읽는다. 형식은 실제 API 응답과 같다 ({SERVICE: {"row": [...]}})."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return data[SERVICE]["row"]


def filter_rows(rows, gu: str, year_month: str, limit: int) -> list[dict]:
    """자치구명(CGG_NM)과 계약 연월(CTRT_DAY 앞 6자리)이 맞는 행을 최근 계약일 순으로 limit 건 돌려준다."""
    if not re.fullmatch(r"\d{6}", year_month or ""):
        raise ValueError("year_month 는 YYYYMM 형식이어야 합니다 (예: 202609)")
    limit = max(0, min(int(limit), PAGE_SIZE))
    hits = [r for r in rows
            if r.get("CGG_NM") == gu and str(r.get("CTRT_DAY", "")).startswith(year_month)]
    hits.sort(key=lambda r: r["CTRT_DAY"], reverse=True)
    return hits[:limit]


def _fetch_page(key: str, start: int, end: int, year: str, gu: str) -> list[dict]:
    # 선택 인자는 순서대로 RCPT_YR / CGG_CD / CGG_NM. 자치구코드 자리는 공백으로 비운다.
    path = "/".join([urllib.parse.quote(key, safe=""), "json", SERVICE, str(start), str(end),
                     year, "%20", urllib.parse.quote(gu, safe="")])
    url = f"{BASE_URL}/{path}/"
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT) as resp:
            data = json.load(resp)
    except (OSError, ValueError):
        # 예외 메시지에 URL(=키)이 섞일 수 있으므로 원인을 붙이지 않는다.
        raise RuntimeError("서울 열린데이터광장 호출 실패 (네트워크 또는 응답 형식)") from None
    body = (data.get(SERVICE) or data) if isinstance(data, dict) else None
    if not isinstance(body, dict):            # 오류 응답은 {"RESULT": ...} 만 오기도 한다
        raise RuntimeError("서울 열린데이터광장 응답 형식이 예상과 다릅니다")
    result = body.get("RESULT") or {}
    code = result.get("CODE", "UNKNOWN")
    if code == "INFO-200":                     # 해당하는 데이터가 없습니다
        return []
    if code != "INFO-000":
        raise RuntimeError(f"서울 열린데이터광장 오류 {code}: {result.get('MESSAGE', '')}")
    return body.get("row", [])


def fetch_trades(key: str, gu: str, year_month: str, limit: int) -> list[dict]:
    """실호출. 접수연도와 자치구명으로 좁혀 받아 계약 연월로 거른다.

    결과는 최근 계약부터 오므로 오래된 달일수록 MAX_PAGES 안에 다 못 받을 수 있다.
    시험 키 sample 은 최근 5건만 한 번 받는다.
    """
    filter_rows([], gu, year_month, limit)    # 인자 검사만
    size, pages = (SAMPLE_KEY_ROWS, 1) if key == SAMPLE_KEY else (PAGE_SIZE, MAX_PAGES)
    found = []
    for page in range(pages):
        start = page * size + 1
        rows = _fetch_page(key, start, start + size - 1, year_month[:4], gu)
        found += filter_rows(rows, gu, year_month, PAGE_SIZE)
        if len(found) >= limit or len(rows) < size:
            break
    return filter_rows(found, gu, year_month, limit)


def search_trades(gu: str, year_month: str, limit: int = 20) -> list[dict]:
    """서울 부동산 실거래가(매매)를 자치구와 계약 연월로 찾는다.

    gu: 자치구명 (예: 강남구). year_month: 계약 연월 YYYYMM (예: 202609). limit: 최대 건수.
    금액 THING_AMT 는 만원, 면적 ARCH_AREA/LAND_AREA 는 ㎡ 이다.
    SEOUL_API_KEY 가 없거나 SEOUL_MOCK=1 이면 합성 샘플 데이터에서 찾는다.
    """
    key = os.environ.get("SEOUL_API_KEY", "").strip()
    if not key or os.environ.get("SEOUL_MOCK") == "1":
        return filter_rows(load_sample(SAMPLE_PATH), gu, year_month, limit)
    return fetch_trades(key, gu, year_month, limit)


def main() -> None:
    try:                                       # mcp 2.x
        from mcp.server.mcpserver import MCPServer as Server
    except ImportError:                        # mcp 1.x
        from mcp.server.fastmcp import FastMCP as Server
    server = Server(SERVER_NAME)
    server.tool()(search_trades)
    server.run()                               # 기본 전송: stdio. stdout 에 print 하지 않는다.


if __name__ == "__main__":
    main()
