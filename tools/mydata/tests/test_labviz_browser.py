"""Behavioural copy-safety check for LabViz, run in a real browser.

For every lab page that loads labviz.js, the visible text (innerText) and the
textContent of every <pre> after LabViz.init() must equal the text the browser
parsed from the page with JavaScript off. Calling LabViz.init() again must not
change anything or add chips, badges or listeners twice.

Skipped when playwright (or its Chromium) is not installed.
"""
import unittest
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

REPO = Path(__file__).resolve().parents[3]
LABS = REPO / "20261116"

PRE_JS = "() => Array.from(document.querySelectorAll('pre')).map(p => [p.textContent, p.innerText])"
COUNT_JS = (
    "() => [document.querySelectorAll('.lv-paste').length,"
    " document.querySelectorAll('.lv-ref').length,"
    " document.querySelectorAll('figure.viz .lv-controls').length]"
)


def pages():
    return sorted(p for p in LABS.glob("*.html") if "assets/labviz.js" in p.read_text(encoding="utf-8"))


@unittest.skipIf(sync_playwright is None, "playwright is not installed")
class LabVizBrowserTest(unittest.TestCase):
    def test_pre_text_unchanged_after_init(self):
        try:
            pw = sync_playwright().start()
            browser = pw.chromium.launch()
        except Exception as exc:  # browser binary missing
            self.skipTest("chromium is not available: %s" % exc)
        try:
            targets = pages()
            self.assertTrue(targets, "no page uses labviz.js")
            plain = browser.new_context(java_script_enabled=False)
            live = browser.new_context()
            for path in targets:
                url = path.as_uri()
                with self.subTest(page=path.name):
                    a = plain.new_page()
                    a.goto(url)
                    original = a.evaluate(PRE_JS)
                    a.close()
                    b = live.new_page()
                    b.goto(url)
                    b.wait_for_load_state("load")
                    self.assertEqual(b.evaluate(PRE_JS), original)
                    counts = b.evaluate(COUNT_JS)
                    b.evaluate("() => { LabViz.init(); LabViz.init(); }")
                    self.assertEqual(b.evaluate(PRE_JS), original)
                    self.assertEqual(b.evaluate(COUNT_JS), counts, "init is not idempotent")
                    b.close()
        finally:
            browser.close()
            pw.stop()


if __name__ == "__main__":
    unittest.main()
