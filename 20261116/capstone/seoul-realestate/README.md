# seoul-realestate: 서울 부동산 실거래가 MCP 서버 골격 (캡스톤 R1-B)

서울 열린데이터광장의 **서울시 부동산 실거래가 정보**를 감싸는 MCP 서버의 출발점입니다.
도구는 `search_trades` 하나이고, 키가 없어도 `sample.json`(합성 데이터)으로 바로 동작합니다.

| 파일 | 내용 |
| --- | --- |
| `server.py` | MCP 서버. 도구 `search_trades(gu, year_month, limit=20)` |
| `sample.json` | **합성 데이터** 90행 (자치구 5개, 2026년 9월과 10월). 값은 지어낸 것이며 실제 거래가 아닙니다 |
| `README.md` | 이 문서 |

## 데이터 출처 (확인한 명세)

- 데이터셋: 서울시 부동산 실거래가 정보 (OA-21275)
  https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do (Open API 탭)
- 서비스 이름: `tbLnOpendataRtmsV`
- 호출 형식: `http://openapi.seoul.go.kr:8088/{KEY}/json/tbLnOpendataRtmsV/{START_INDEX}/{END_INDEX}/{RCPT_YR}/{CGG_CD}/{CGG_NM}/...`
  - 앞의 다섯 자리(KEY, TYPE, SERVICE, START_INDEX, END_INDEX)는 필수이고 순서를 바꿀 수 없습니다.
  - 뒤의 선택 인자는 순서대로 `RCPT_YR`(접수연도), `CGG_CD`(자치구코드), `CGG_NM`(자치구명), `STDG_CD`, `LOTNO_SE`, `LOTNO_SE_NM`, `MNO`, `SNO`, `BLDG_NM`, `CTRT_DAY`(계약일 YYYYMMDD), `BLDG_USG`(아파트, 단독다가구, 연립다세대, 오피스텔 중 하나)입니다.
  - `server.py`는 `.../1/1000/2026/%20/강남구/`처럼 자치구코드 자리를 공백으로 비우고 자치구명으로 좁힌 뒤, 계약 연월(`CTRT_DAY` 앞 6자리)로 다시 거릅니다.
- 한 번에 최대 1000건(ERROR-336). 시험 키 `sample`은 한 번에 5건까지(ERROR-335).
- 응답 필드 (`row` 안): `RCPT_YR` 접수연도, `CGG_CD` 자치구코드, `CGG_NM` 자치구명, `STDG_CD` 법정동코드, `STDG_NM` 법정동명, `LOTNO_SE` 지번구분, `LOTNO_SE_NM` 지번구분명, `MNO` 본번, `SNO` 부번, `BLDG_NM` 건물명, `CTRT_DAY` 계약일, `THING_AMT` 물건금액(만원), `ARCH_AREA` 건물면적(㎡), `LAND_AREA` 토지면적(㎡), `FLR` 층, `RGHT_SE` 권리구분, `RTRCN_DAY` 취소일, `ARCH_YR` 건축년도, `BLDG_USG` 건물용도, `DCLR_SE` 신고구분, `OPBIZ_RESTAGNT_SGG_NM` 신고한 개업공인중개사 시군구명
- 결과 코드: `INFO-000` 정상, `INFO-200` 데이터 없음, `INFO-100` 인증키가 유효하지 않음

`sample.json`은 위 응답과 같은 모양(`{"tbLnOpendataRtmsV": {"row": [...]}}`)과 같은 필드 이름을 씁니다.
자치구코드와 법정동코드 쌍은 실제 응답에서 가져왔고, 건물명("샘플아파트" 등), 번지, 금액, 면적은 지어낸 값입니다.
이상 거래 실습용으로 눈에 띄는 행 몇 개(시세보다 크게 낮거나 높은 금액, 취소일이 있는 거래)를 일부러 넣었습니다.
취소일(`RTRCN_DAY`)의 실제 형식은 실데이터에서 확인하지 못해 YYYYMMDD로 가정했습니다.

## 키 발급

1. https://data.seoul.go.kr 에 로그인합니다.
2. 나의화면, 인증키 신청 (https://data.seoul.go.kr/together/mypage/actkeyMain.do) 에서 **일반 인증키**를 신청합니다.
3. 이용 안내: https://data.seoul.go.kr/together/guide/useGuide.do

키는 **환경 변수나 사용자 설정으로만** 넣습니다. 이 폴더의 파일, `.mcp.json`, 커밋에 넣지 않습니다.

**평문 HTTP 주의.** 이 Open API는 `http://openapi.seoul.go.kr:8088` 평문 HTTP로만 제공되고(`server.py`의 `BASE_URL`), 키가 URL 경로에 들어갑니다.
즉 실호출마다 키가 암호화되지 않은 채 네트워크로 오갑니다. 업무용이나 공용 키가 아니라 **본인 계정의 키, 언제든 폐기하고 다시 받을 수 있는 키**만 씁니다.
공용 와이파이 같은 믿을 수 없는 네트워크에서는 실호출하지 않고, 노출이 의심되면 인증키 관리에서 키를 새로 받습니다.

## 실행

`mcp` 패키지는 Python 3.10 이상이 필요합니다. 시스템 `python3`가 더 낮으면 uv로 Python 3.12 가상환경을 만듭니다.

```bash
cd ~/claude-lab/capstone/seoul-realestate
python3 -m venv .venv && .venv/bin/python -c 'import sys; sys.exit(sys.version_info < (3, 10))' \
  || { rm -rf .venv; curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="$HOME/.local/bin" sh; "$HOME/.local/bin/uv" venv --seed -q -p 3.12 .venv; }
.venv/bin/pip install -q "mcp>=1.2,<2.4"
SEOUL_MOCK=1 .venv/bin/python -c 'import server; print(len(server.search_trades("강남구", "202609", 5)))'
```

등록은 Claude 세션 밖의 터미널에서, 작업 폴더 `~/claude-lab/capstone`에서 합니다. 범위는 기본값 local(이 폴더에서만, 저장 위치 `~/.claude.json`)입니다. `--env` 바로 뒤에 서버 이름을 두면 이름이 또 하나의 환경 변수로 읽힐 수 있어, 공식 문서대로 `--env`와 이름 사이에 `--transport stdio`를 둡니다.

```bash
cd ~/claude-lab/capstone
claude mcp add --env SEOUL_MOCK=1 --transport stdio seoul-realestate -- "$HOME/claude-lab/capstone/seoul-realestate/.venv/bin/python" "$HOME/claude-lab/capstone/seoul-realestate/server.py"
claude mcp list
```

키가 나오면 다시 등록합니다. 키는 명령에 직접 쓰지 않고 `read -rs`로 받아(화면과 셸 기록에 남지 않음) 등록한 뒤 변수를 지웁니다.
키는 `~/.claude.json`(사용자 설정, 작업 폴더 밖)에만 남습니다.

```bash
cd ~/claude-lab/capstone
read -rs SEOUL_API_KEY
claude mcp remove seoul-realestate
claude mcp add --env SEOUL_API_KEY="$SEOUL_API_KEY" --transport stdio seoul-realestate -- "$HOME/claude-lab/capstone/seoul-realestate/.venv/bin/python" "$HOME/claude-lab/capstone/seoul-realestate/server.py"
unset SEOUL_API_KEY
claude mcp list
```

| 조건 | 동작 |
| --- | --- |
| `SEOUL_API_KEY` 없음 | `sample.json`에서 찾는다 (mock) |
| `SEOUL_MOCK=1` | 키가 있어도 mock |
| `SEOUL_API_KEY=sample` | 실호출, 최근 5건만 |
| 그 밖의 키 | 실호출, 1000건씩 최대 5번 |

`mcp` 1.x와 2.x 둘 다에서 동작합니다(시험한 버전 1.30.0, 2.3.0, 설치 범위 `>=1.2,<2.4`) (2.x에서는 `FastMCP`가 `MCPServer`로 이름이 바뀌었고, `server.py`가 둘 다 시도합니다).
- python-sdk: https://github.com/modelcontextprotocol/python-sdk (v2 이름 변경은 `docs/migration.md`)
- `claude mcp add`: https://code.claude.com/docs/en/mcp
