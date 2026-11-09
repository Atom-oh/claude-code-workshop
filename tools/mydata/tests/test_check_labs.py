import subprocess
import tempfile
import unittest
from pathlib import Path

from tools.mydata.check_labs import check
from tools.mydata.validate import load_pattern

URL = "https://example.test/mydata-kit.zip"
MANIFEST = {
    "pseudo/customers.csv",
    "raw/customers.csv",
    "checkpoints/ch2/a.md",
    "checkpoints/ch3/segments.md",
    "checkpoints/ch4/b.md",
}
RESTORE = (
    '<pre>[ -d ~/claude-lab/mydata/pseudo ] || (curl -fsSL "%s" -o /tmp/kit.zip)</pre>' % URL
)


def page(task00="", body="", minutes=2):
    return (
        "<html><body><h2>TASK 00 &middot; prep (%d분)</h2>%s%s</body></html>"
        % (minutes, task00 or RESTORE, body)
    )


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

    def run_check(self, pages, **kw):
        # The committed pages double as the rule 4 baseline, so only the
        # rule under test can fail.
        rev = self.commit(pages)
        return check(self.labs, MANIFEST, baseline_rev=kw.pop("baseline_rev", rev))

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
        self.assertIn("mydata-kit.zip", errs[0])

    def test_time_budget_exceeded(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        rev = self.commit(full_set(**{name: page(minutes=5) + "<h2>선택 TASK 09 (99분)</h2>"}))
        # Same total (optional task ignored) passes; a larger required total fails.
        self.assertEqual(check(self.labs, MANIFEST, baseline_rev=rev), [])
        self.write({name: page(minutes=6)})  # uncommitted edit vs baseline
        errs = check(self.labs, MANIFEST, baseline_rev=rev)
        self.assertEqual(len(errs), 1)
        self.assertTrue(errs[0].startswith(name + ": rule 4"))

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
        other = RESTORE.replace("example.test", "other.test")
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

    def test_unresolvable_baseline_is_an_error(self):
        errs = self.run_check(full_set(), baseline_rev="deadbeef0000")
        self.assertEqual(errs, ["rule 4: baseline deadbeef0000 not found"])

    def test_unparsable_task_minutes_is_an_error(self):
        name = "ClaudeCode_Ch1_HandsOnLab.html"
        for bad in ("(5~7분)", "(약 5분)"):
            body = "<h2>TASK 01 · x %s</h2><h2>선택 TASK 02 · y %s</h2>" % (bad, bad)
            errs = self.run_check(full_set(**{name: page(body=body)}))
            self.assertEqual(len(errs), 2, bad)
            self.assertTrue(all(e.startswith(name + ": rule 4") and "minutes" in e for e in errs))
        ok = "<h2>TASK 01 · x (5 분)</h2>"
        self.assertEqual(self.run_check(full_set(**{name: page(body=ok)})), [])

    def test_guardrails_requires_a_pat(self):
        name = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"
        errs = self.run_check(full_set(**{name: page()}))
        self.assertEqual(errs, [name + ": rule 2: no PAT='...' found"])


if __name__ == "__main__":
    unittest.main()
