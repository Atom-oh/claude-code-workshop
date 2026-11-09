"""Tests for the R1-B Seoul real estate MCP skeleton (20261116/capstone/seoul-realestate/).

Standard library only, no network: the `mcp` package is not needed and
urllib.request.urlopen is patched for the real-mode tests.
"""
import importlib.util
import io
import json
import os
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[3]
KIT = ROOT / "20261116" / "capstone" / "seoul-realestate"

# Field names of the tbLnOpendataRtmsV response, from the official spec
# https://data.seoul.go.kr/dataList/OA-21275/S/1/datasetView.do (Open API tab)
FIELDS = [
    "RCPT_YR", "CGG_CD", "CGG_NM", "STDG_CD", "STDG_NM", "LOTNO_SE", "LOTNO_SE_NM",
    "MNO", "SNO", "BLDG_NM", "CTRT_DAY", "THING_AMT", "ARCH_AREA", "LAND_AREA", "FLR",
    "RGHT_SE", "RTRCN_DAY", "ARCH_YR", "BLDG_USG", "DCLR_SE", "OPBIZ_RESTAGNT_SGG_NM",
]
GU_FIELD = "CGG_NM"
DAY_FIELD = "CTRT_DAY"
FIRST_MONTH = "202609"


def load_server():
    spec = importlib.util.spec_from_file_location("seoul_realestate_server", KIT / "server.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


server = load_server()


def run_search(env, **kwargs):
    with mock.patch.dict(os.environ, env, clear=True):
        return server.search_trades(**kwargs)


def api_response(rows, code="INFO-000"):
    body = {server.SERVICE: {"list_total_count": len(rows),
                             "RESULT": {"CODE": code, "MESSAGE": "test"},
                             "row": rows}}
    return io.BytesIO(json.dumps(body, ensure_ascii=False).encode("utf-8"))


class SampleDataTest(unittest.TestCase):
    def setUp(self):
        self.rows = server.load_sample(KIT / "sample.json")

    def test_sample_size_and_spread(self):
        self.assertGreaterEqual(len(self.rows), 50)
        self.assertGreaterEqual(len({r[GU_FIELD] for r in self.rows}), 5)
        self.assertGreaterEqual(len({r[DAY_FIELD][:6] for r in self.rows}), 2)
        self.assertIn(FIRST_MONTH, {r[DAY_FIELD][:6] for r in self.rows})

    def test_sample_uses_official_field_names(self):
        for r in self.rows:
            self.assertEqual(list(r), FIELDS)

    def test_sample_is_marked_synthetic(self):
        meta = json.loads((KIT / "sample.json").read_text(encoding="utf-8"))["_meta"]
        self.assertIn("합성 데이터", meta["note"])
        self.assertIn("합성 데이터", (KIT / "README.md").read_text(encoding="utf-8"))


class FilterTest(unittest.TestCase):
    def test_filter_by_gu_month_and_limit(self):
        rows = server.load_sample(KIT / "sample.json")
        got = server.filter_rows(rows, "마포구", FIRST_MONTH, 3)
        self.assertTrue(0 < len(got) <= 3)
        for r in got:
            self.assertEqual(r[GU_FIELD], "마포구")
            self.assertTrue(r[DAY_FIELD].startswith(FIRST_MONTH))
        days = [r[DAY_FIELD] for r in got]
        self.assertEqual(days, sorted(days, reverse=True))

    def test_bad_year_month_is_rejected(self):
        with self.assertRaises(ValueError):
            server.filter_rows([], "강남구", "2026-09", 5)


class MockModeTest(unittest.TestCase):
    def test_mock_mode_without_key(self):
        env = {k: v for k, v in os.environ.items() if k != "SEOUL_API_KEY"}
        rows = run_search(env, gu="강남구", year_month=FIRST_MONTH, limit=5)
        self.assertTrue(0 < len(rows) <= 5)
        self.assertTrue(all(r[GU_FIELD] == "강남구" for r in rows))

    def test_mock_flag_wins_over_key_and_makes_no_call(self):
        with mock.patch("urllib.request.urlopen") as urlopen:
            rows = run_search({"SEOUL_MOCK": "1", "SEOUL_API_KEY": "TESTKEY123"},
                              gu="강남구", year_month=FIRST_MONTH)
        urlopen.assert_not_called()
        self.assertTrue(rows)

    def test_key_never_returned(self):
        rows = run_search({"SEOUL_MOCK": "1", "SEOUL_API_KEY": "TESTKEY123"},
                          gu="강남구", year_month=FIRST_MONTH)
        self.assertNotIn("TESTKEY123", json.dumps(rows, ensure_ascii=False))


class RealModeTest(unittest.TestCase):
    ENV = {"SEOUL_API_KEY": "TESTKEY123"}

    def test_calls_only_seoul_openapi_and_filters_month(self):
        rows = server.load_sample(KIT / "sample.json")
        with mock.patch("urllib.request.urlopen", return_value=api_response(rows)) as urlopen:
            got = run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH, limit=5)
        url = urlopen.call_args[0][0]
        self.assertTrue(url.startswith("http://openapi.seoul.go.kr:8088/"))
        self.assertIn("/json/tbLnOpendataRtmsV/1/", url)
        self.assertTrue(0 < len(got) <= 5)
        self.assertTrue(all(r[GU_FIELD] == "강남구" and r[DAY_FIELD].startswith(FIRST_MONTH)
                            for r in got))
        self.assertNotIn("TESTKEY123", json.dumps(got, ensure_ascii=False))

    def test_sample_key_asks_for_five_rows_once(self):
        with mock.patch("urllib.request.urlopen", return_value=api_response([])) as urlopen:
            run_search({"SEOUL_API_KEY": "sample"}, gu="강남구", year_month=FIRST_MONTH)
        self.assertEqual(urlopen.call_count, 1)
        self.assertIn("/tbLnOpendataRtmsV/1/5/2026/%20/", urlopen.call_args[0][0])

    def test_paging_stops_at_max_pages(self):
        full = [dict(server.load_sample(KIT / "sample.json")[0], CGG_NM="강남구",
                     CTRT_DAY="20260101")] * server.PAGE_SIZE
        with mock.patch("urllib.request.urlopen",
                        side_effect=lambda *a, **k: api_response(full)) as urlopen:
            self.assertEqual(run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH), [])
        self.assertEqual(urlopen.call_count, server.MAX_PAGES)

    def test_no_data_returns_empty(self):
        with mock.patch("urllib.request.urlopen", return_value=api_response([], "INFO-200")):
            self.assertEqual(run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH), [])

    def test_api_error_message_hides_key(self):
        with mock.patch("urllib.request.urlopen", return_value=api_response([], "INFO-100")):
            with self.assertRaises(RuntimeError) as ctx:
                run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH)
        self.assertIn("INFO-100", str(ctx.exception))
        self.assertNotIn("TESTKEY123", str(ctx.exception))

    def test_non_object_body_gives_friendly_error(self):
        for body in (b"[]", b'"oops"', json.dumps({server.SERVICE: [1, 2]}).encode()):
            with mock.patch("urllib.request.urlopen", return_value=io.BytesIO(body)):
                with self.assertRaises(RuntimeError) as ctx:
                    run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH)
            self.assertIn("응답 형식", str(ctx.exception))
            self.assertNotIn("TESTKEY123", str(ctx.exception))

    def test_network_error_message_hides_key(self):
        err = OSError("connect failed for http://openapi.seoul.go.kr:8088/TESTKEY123/json")
        with mock.patch("urllib.request.urlopen", side_effect=err):
            with self.assertRaises(RuntimeError) as ctx:
                run_search(self.ENV, gu="강남구", year_month=FIRST_MONTH)
        self.assertNotIn("TESTKEY123", str(ctx.exception))
        self.assertIsNone(ctx.exception.__cause__)
        self.assertTrue(ctx.exception.__suppress_context__)


if __name__ == "__main__":
    unittest.main()
