import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from tools.mydata.check_viz import check

REPO = Path(__file__).resolve().parents[3]
LABS = REPO / "20261116"
LABVIZ_JS = LABS / "assets" / "labviz.js"
LABVIZ_CSS = LABS / "assets" / "labviz.css"

HEAD = (
    '<link rel="stylesheet" href="assets/labviz.css">'
    '<script defer src="assets/labviz.js"></script>'
)
COPY = "<script>var t=c.dataset.raw||c.innerText;</script>"
JS = (
    "// test fixture\n"
    'LabViz.register("kit-download", {nodes:[{id:"s3", icon:"S3-Bucket"}]});\n'
)
BLOCK = (
    '<div class="code copyable"><div class="code-head"><span>bash</span>'
    '<button class="copy" type="button">복사</button></div>'
    "<pre><code>echo one\necho two\necho three</code></pre></div>"
)


def explain(lines="1-3", summary="이 블록이 하는 일 (붙여넣는 곳: 터미널)"):
    return (
        '<details class="cmd-explain"><summary>%s</summary><ol>'
        '<li data-lines="%s">설명입니다.</li></ol></details>' % (summary, lines)
    )


def page(body, head=HEAD, copy=COPY):
    return "<html><head>%s</head><body>%s%s</body></html>" % (head, body, copy)


class CheckVizTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.dir = Path(tmp.name)
        (self.dir / "assets" / "aws-icons").mkdir(parents=True)
        (self.dir / "assets" / "aws-icons" / "S3-Bucket.svg").write_text("<svg/>")
        (self.dir / "assets" / "labviz.js").write_text(JS)

    def write(self, html, name="ClaudeCode_Test.html"):
        (self.dir / name).write_text(html, encoding="utf-8")

    def assertError(self, needle):
        errors = check(self.dir)
        self.assertTrue(
            any(needle in e for e in errors), "%r not in %r" % (needle, errors)
        )

    def test_valid_page_passes(self):
        self.write(
            page(
                '<figure class="viz" data-viz="kit-download"><figcaption>그림</figcaption>'
                "</figure>" + BLOCK + "\n" + explain()
            )
        )
        self.assertEqual(check(self.dir), [])

    def test_page_without_features_needs_no_links(self):
        self.write("<html><head></head><body>%s</body></html>" % BLOCK)
        self.assertEqual(check(self.dir), [])

    def test_unknown_viz_name(self):
        self.write(page('<figure class="viz" data-viz="nope"></figure>'))
        self.assertError('unknown viz "nope"')

    def test_explainer_without_preceding_block(self):
        self.write(page("<p>text</p>" + explain()))
        self.assertError("does not follow a .code block")

    def test_explainer_after_paragraph_after_block(self):
        self.write(page(BLOCK + "<p>between</p>" + explain()))
        self.assertError("does not follow a .code block")

    def test_out_of_range_lines(self):
        self.write(page(BLOCK + explain("2-4")))
        self.assertError('data-lines "2-4" outside 1-3')

    def test_bad_lines_syntax(self):
        self.write(page(BLOCK + explain("two")))
        self.assertError('bad data-lines "two"')

    def test_summary_names_paste_target(self):
        self.write(page(BLOCK + explain(summary="설명")))
        self.assertError("summary does not say where to paste")

    def test_missing_asset_link(self):
        self.write(page(BLOCK + explain(), head='<link rel="stylesheet" href="assets/labviz.css">'))
        self.assertError("missing assets/labviz.js")
        self.write(page(BLOCK + explain(), head='<script defer src="assets/labviz.js"></script>'))
        self.assertError("missing assets/labviz.css")

    def test_copy_handler_must_use_raw(self):
        self.write(page(BLOCK + explain(), copy="<script>var t=c.innerText;</script>"))
        self.assertError("copy handler does not read data-raw")

    def test_missing_icon_file(self):
        (self.dir / "assets" / "aws-icons" / "S3-Bucket.svg").unlink()
        self.write(page(""))
        self.assertError("icon S3-Bucket.svg missing")

    def test_cli_ok_and_error(self):
        self.write(page(BLOCK + explain()))
        script = REPO / "tools" / "mydata" / "check_viz.py"
        ok = subprocess.run([sys.executable, str(script), str(self.dir)], capture_output=True, text=True)
        self.assertEqual((ok.returncode, ok.stdout.strip()), (0, "OK"))
        self.write(page(BLOCK + explain("9")))
        bad = subprocess.run([sys.executable, str(script), str(self.dir)], capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1)
        self.assertIn("outside 1-3", bad.stdout)


class RealAssetsTest(unittest.TestCase):
    def test_repo_pages_pass(self):
        self.assertEqual(check(LABS), [])

    def test_copy_text_unchanged(self):
        """labviz.js keeps the original text in data-raw before wrapping lines."""
        js = LABVIZ_JS.read_text(encoding="utf-8")
        raw_at = js.find("dataset.raw =")
        wrap_at = js.find("function wrapLines")
        self.assertGreater(raw_at, -1, "labviz.js must store dataset.raw")
        body = js[wrap_at : js.find("\n  }\n", wrap_at)]
        self.assertIn("dataset.raw =", body, "wrapLines must store dataset.raw")
        self.assertLess(body.find("dataset.raw ="), body.find("createElement"))
        # Wrapping only adds inline spans: the newlines stay as text nodes.
        self.assertIn('createTextNode("\\n")', body)
        # The page's copy button reads the stored original first.
        preflight = (LABS / "ClaudeCode_Preflight_Check.html").read_text(encoding="utf-8")
        self.assertIn("dataset.raw||", preflight)

    def test_css_has_no_hard_coded_black_or_white(self):
        css = LABVIZ_CSS.read_text(encoding="utf-8").lower()
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        # Colour keywords only; "white-space" is a property, not a colour.
        self.assertNotRegex(css, r"#(fff|000)(?![0-9a-f])|#(ffffff|000000)\b")
        self.assertNotRegex(css, r"(?<![\w-])(white|black)(?![\w-])")


if __name__ == "__main__":
    unittest.main()
