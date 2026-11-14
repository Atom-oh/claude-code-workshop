import subprocess
import tempfile
import unittest
from pathlib import Path

from tools.mydata.check_labs import check
from tools.mydata.validate import load_pattern

URL = "s3://example-bucket/abc/mydata-kit.zip"
MANIFEST = {
    "pseudo/customers.csv",
    "raw/customers.csv",
    "checkpoints/ch2/a.md",
    "checkpoints/ch3/segments.md",
    "checkpoints/ch4/b.md",
}
RESTORE = (
    '<pre>[ -d ~/claude-lab/mydata/pseudo ] || (aws s3 cp "%s" /tmp/kit.zip)</pre>' % URL
)
CURL_RESTORE = (
    '<pre>[ -d ~/claude-lab/mydata/pseudo ] || '
    '(curl -fsSL "https://example.test/mydata-kit.zip" -o /tmp/kit.zip)</pre>'
)


def page(task00="", body=""):
    return "<html><body><h2>TASK 00 &middot; prep</h2>%s%s</body></html>" % (task00 or RESTORE, body)


def full_set(**overrides):
    """A passing set of pages; overrides replace individual pages."""
    ch4 = page(
        RESTORE
        + "<pre>cp -r ~/claude-lab/mydata/checkpoints/ch2/ x; "
        "cp -r ~/claude-lab/mydata/checkpoints/ch3/ y</pre>"
    )
    ch5 = page(RESTORE + "<pre>cp -r ~/claude-lab/mydata/checkpoints/ch4/ z</pre>")
    pages = {
        "ClaudeCode_Preflight_Check.html": "<html>%s</html>" % RESTORE,
        "ClaudeCode_Ch1_HandsOnLab.html": page(),
        "ClaudeCode_Ch2_HandsOnLab.html": page(),
        "ClaudeCode_Ch2_Guardrails_HandsOnLab.html": page(
            body="PAT=&#x27;%s&#x27;" % load_pattern().pattern
        ),
        "ClaudeCode_Ch3_HandsOnLab.html": page(),
        "ClaudeCode_Ch4_HandsOnLab.html": ch4,
        "ClaudeCode_Ch5_HandsOnLab.html": ch5,
        "ClaudeCode_Ch6_HandsOnLab.html": page(),
    }
    pages.update(overrides)
    return pages


class CheckLabsTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        self.labs = self.root / "20261116"
        self.labs.mkdir()
        self.git("init", "-q")
        self.git("config", "user.email", "t@t")
        self.git("config", "user.name", "t")

    def git(self, *args):
        return subprocess.run(
            ["git", *args], cwd=self.root, check=True, capture_output=True, text=True
        ).stdout.strip()

    def write(self, pages):
        for name, html in pages.items():
            (self.labs / name).write_text(html, encoding="utf-8")

    def commit(self, pages):
        """Write pages and commit them; returns the new revision."""
        self.write(pages)
        self.git("add", "-A")
        self.git("commit", "-qm", "base")
        return self.git("rev-parse", "HEAD")

    def run_check(self, pages):
        self.write(pages)
        return check(self.labs, MANIFEST)

    def test_clean_set_passes(self):
        self.assertEqual(self.run_check(full_set()), [])

    def test_unknown_mydata_path(self):
        name = "ClaudeCode_Ch6_HandsOnLab.html"
        errs = self.run_check(full_set(**{name: page(body="<code>~/claude-lab/mydata/pseudo/nope.csv</code>")}))
        self.assertEqual(len(errs), 1)
        self.assertTrue(errs[0].startswith(name + ": rule 1"))
        self.assertIn("pseudo/nope.csv", errs[0])

    def test_directory_and_glob_refs_pass(self):
        body = (
            "<code>~/claude-lab/mydata ~/claude-lab/mydata/ ~/claude-lab/mydata/pseudo/ "
            "~/claude-lab/mydata/checkpoints/ch3/* ~/claude-lab/mydata/pseudo/customers.csv.</code>"
        )
        self.assertEqual(self.run_check(full_set(**{"ClaudeCode_Ch6_HandsOnLab.html": page(body=body)})), [])

    def test_lab_dlp_pattern_matches_source(self):
        good = "PAT=&#x27;%s&#x27;" % load_pattern().pattern
        name = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"
        self.assertEqual(self.run_check(full_set(**{name: page(body=good)})), [])
        bad = "PAT='[0-9]{6}-[1-4][0-9]{6}'"
        errs = self.run_check(full_set(**{name: page(body=bad)}))
        self.assertEqual(len(errs), 1)
        self.assertTrue(errs[0].startswith(name + ": rule 2"))

    def test_every_task00_restore_path_in_manifest(self):
        name = "ClaudeCode_Ch4_HandsOnLab.html"
        only_ch2 = page(RESTORE + "<pre>cp -r ~/claude-lab/mydata/checkpoints/ch2/ x</pre>")
        errs = self.run_check(full_set(**{name: only_ch2}))
        self.assertEqual(len(errs), 1)
        self.assertIn("rule 3", errs[0])
        self.assertIn("checkpoints/ch3/", errs[0])

    def test_missing_redownload_fallback(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        errs = self.run_check(full_set(**{name: page(task00="<pre>echo hi</pre>")}))
        self.assertEqual(len(errs), 1)
        self.assertIn("rule 3", errs[0])
        self.assertIn("aws s3 cp of mydata-kit.zip", errs[0])

    def test_curl_kit_download_rejected(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        errs = self.run_check(full_set(**{name: page(task00=CURL_RESTORE)}))
        self.assertTrue(any(e == name + ": rule 3: TASK 00 lacks aws s3 cp of mydata-kit.zip" for e in errs))
        self.assertTrue(any(e == name + ": rule 6: stale curl kit download" for e in errs))
        pre = "ClaudeCode_Preflight_Check.html"
        errs = self.run_check(full_set(**{pre: "<html>%s</html>" % CURL_RESTORE}))
        self.assertIn(pre + ": rule 3: no aws s3 cp of mydata-kit.zip", errs)
        placeholder = page(task00=RESTORE + "<pre>URL=https://MYDATA_KIT_URL/mydata-kit.zip</pre>")
        errs = self.run_check(full_set(**{name: placeholder}))
        self.assertEqual(errs, [name + ": rule 6: stale curl kit download"])

    def test_lab_pages_state_no_minutes(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        for heading in ("TASK 01 · x (5분)", "선택 TASK 02 · y (7분)", "TASK 03 · z (5~7분)", "TASK 04 · w (약 5분)",
                        "TASK 05 · v (5분 내외)", "TASK 06 · u (10분 남짓)", "TASK 07 · t (5분) — 선택"):
            errs = self.run_check(full_set(**{name: page(body="<h2>%s</h2>" % heading)}))
            self.assertEqual(len(errs), 1, heading)
            self.assertTrue(errs[0].startswith(name + ": rule 4: heading states minutes"), errs)
        pre = "ClaudeCode_Preflight_Check.html"
        errs = self.run_check(full_set(**{pre: "<html>%s<h2>CHECK 01 · 접속 (1분)</h2></html>" % RESTORE}))
        self.assertEqual(len(errs), 1)
        self.assertTrue(errs[0].startswith(pre + ": rule 4"))
        errs = self.run_check(full_set(**{name: page(body="<p>소요 시간 <strong>20분</strong></p>")}))
        self.assertEqual(errs, [name + ": rule 4: states 소요 시간 (times come from the eDM)"])

    def test_session_length_prose_is_flagged(self):
        name = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"
        base = full_set()[name]
        for phrase in ("Ch2 강의에 이어지는 55분 실습 세션으로", "7분 프리플라이트", "20분 랩"):
            errs = self.run_check(full_set(**{name: base.replace("</body>", "<p>%s</p></body>" % phrase)}))
            self.assertEqual(len(errs), 1, phrase)
            self.assertTrue(errs[0].startswith(name + ": rule 4: states a session length"), errs)
        in_code = base.replace("</body>", "<pre>echo 5분 실습</pre></body>")
        self.assertEqual(self.run_check(full_set(**{name: in_code})), [])

    def test_operational_minutes_in_prose_are_fine(self):
        name = "ClaudeCode_Ch5_HandsOnLab.html"
        body = "<h2>TASK 01 · 캐시</h2><p>캐시 수명(TTL)은 5분입니다. 2~3분 뒤 새로고침합니다.</p>"
        ch5 = full_set()[name].replace("</body>", body + "</body>")
        self.assertEqual(self.run_check(full_set(**{name: ch5})), [])

    def test_rule3_requires_real_download_command(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        msg = name + ": rule 3: TASK 00 lacks aws s3 cp of mydata-kit.zip"
        prose = "<p>aws s3 cp is used; kit at %s</p>" % URL
        self.assertEqual(self.run_check(full_set(**{name: page(task00=prose)})), [msg])
        other = '<pre>aws s3 cp s3://other/x.zip /tmp/x.zip</pre><p>%s</p>' % URL
        self.assertEqual(self.run_check(full_set(**{name: page(task00=other)})), [msg])
        pre = "ClaudeCode_Preflight_Check.html"
        errs = self.run_check(full_set(**{pre: "<html><p>aws s3 cp %s</p></html>" % URL}))
        self.assertEqual(errs, [pre + ": rule 3: no aws s3 cp of mydata-kit.zip"])
        for cp in ('"$KIT"', "$KIT", '--only-show-errors "$KIT"'):
            ok = "<pre>KIT=${WS_KIT:-%s}\n[ -d x ] || (aws s3 cp %s /tmp/k.zip)</pre>" % (URL, cp)
            self.assertEqual(self.run_check(full_set(**{name: page(task00=ok)})), [], cp)
        split = "<pre>KIT=${WS_KIT:-%s}</pre><pre>aws s3 cp \"$KIT\" /tmp/k.zip</pre>" % URL
        self.assertEqual(self.run_check(full_set(**{name: page(task00=split)})), [msg])

    def test_rule7_event_kit_first_and_signed(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        plain = "<pre>KIT=%s\n[ -d x ] || (aws s3 cp \"$KIT\" /tmp/k.zip)</pre>" % URL
        errs = self.run_check(full_set(**{name: page(task00=plain)}))
        self.assertEqual(len(errs), 1)
        self.assertTrue(errs[0].startswith(name + ": rule 7: KIT= must be the unquoted ${WS_KIT:-"), errs)
        unsigned = ("<pre>KIT=${WS_KIT:-%s}\n[ -d x ] || "
                    "(aws s3 cp --no-sign-request \"$KIT\" /tmp/k.zip)</pre>" % URL)
        msg = name + ": rule 7: aws s3 cp of the kit must be signed (no --no-sign-request)"
        self.assertEqual(self.run_check(full_set(**{name: page(task00=unsigned)})), [msg])
        trailing = ("<pre>KIT=${WS_KIT:-%s}\n[ -d x ] || "
                    "(aws s3 cp \"$KIT\" /tmp/k.zip --no-sign-request)</pre>" % URL)
        self.assertEqual(self.run_check(full_set(**{name: page(task00=trailing)})), [msg])
        literal = ('<pre>[ -d ~/claude-lab/mydata/pseudo ] || '
                   '(aws s3 cp --no-sign-request "%s" /tmp/kit.zip)</pre>' % URL)
        self.assertEqual(self.run_check(full_set(**{name: page(task00=literal)})), [msg])

    def test_stale_curl_only_in_code(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        stale = name + ": rule 6: stale curl kit download"
        prose = RESTORE + "<p>Do not use curl for mydata-kit.zip.</p>"
        self.assertEqual(self.run_check(full_set(**{name: page(task00=prose)})), [])
        multi = RESTORE + '<pre>curl -fsSL "$URL" \\\n  -o /tmp/mydata-kit.zip</pre>'
        self.assertEqual(self.run_check(full_set(**{name: page(task00=multi)})), [stale])
        single = RESTORE + '<pre>curl -fsSL &quot;$URL&quot; -o /tmp/mydata-kit.zip</pre>'
        self.assertEqual(self.run_check(full_set(**{name: page(task00=single)})), [stale])

    def test_ch1_ch3_do_not_reference_transaction_files(self):
        for name in ("ClaudeCode_Ch1_HandsOnLab.html", "ClaudeCode_Ch3_HandsOnLab.html"):
            for f in ("bank_transactions.csv", "card_transactions.csv"):
                errs = self.run_check(full_set(**{name: page(body="<p>%s</p>" % f)}))
                self.assertEqual(len(errs), 1, (name, f))
                self.assertEqual(errs[0], "%s: rule 5: references %s" % (name, f))
        # Other chapters may mention them.
        ok = full_set(**{"ClaudeCode_Ch6_HandsOnLab.html": page(body="<p>bank_transactions.csv</p>")})
        self.assertEqual(self.run_check(ok), [])

    def test_inconsistent_kit_url(self):
        name = "ClaudeCode_Ch6_HandsOnLab.html"
        other = RESTORE.replace("example-bucket", "other-bucket")
        errs = self.run_check(full_set(**{name: page(task00=other)}))
        self.assertTrue(errs)
        self.assertTrue(all("rule 6" in e for e in errs))
        self.assertTrue(any(e.startswith(name + ":") for e in errs))

    def test_missing_page_is_an_error(self):
        pages = full_set()
        del pages["ClaudeCode_Ch5_HandsOnLab.html"]
        errs = self.run_check(pages)
        self.assertEqual(errs, ["ClaudeCode_Ch5_HandsOnLab.html: missing lab page"])
        empty = check(self.root / "empty", MANIFEST)
        self.assertEqual(sum(e.endswith("missing lab page") for e in empty), 8)

    def test_guardrails_requires_a_pat(self):
        name = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"
        errs = self.run_check(full_set(**{name: page()}))
        self.assertEqual(errs, [name + ": rule 2: no PAT='...' found"])


if __name__ == "__main__":
    unittest.main()
