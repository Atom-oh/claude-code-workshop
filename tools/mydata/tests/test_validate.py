import shutil
import tempfile
import unittest
from pathlib import Path

from tools.mydata.generate import generate
from tools.mydata.validate import count_matches, load_pattern, validate


class ValidateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        cls.base = Path(cls._tmp.name) / "base"
        generate(cls.base)

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def setUp(self):
        self._work = tempfile.TemporaryDirectory()
        self.addCleanup(self._work.cleanup)
        self.data = Path(self._work.name) / "data"
        shutil.copytree(self.base, self.data)

    def test_generated_data_passes(self):
        # Also covers: pseudo/ has 0 matches, raw/ has >= 1000.
        self.assertEqual(validate(self.base), [])

    def test_load_pattern(self):
        self.assertTrue(load_pattern().search("010-0123-4567"))

    def test_pattern_ignores_digits_inside_longer_numbers(self):
        pat = load_pattern()
        for text in ("print(170767500-170886300)", "20260928-20261028", "0610212-1916489"):
            with self.subTest(text=text):
                self.assertIsNone(pat.search(text))
        for text in ("900101-1234567", "카드4111-1111-1111-9893", "계좌 123-456789-01234",
                     "AKIAABCDEFGHIJKLMNOP"):
            with self.subTest(text=text):
                self.assertTrue(pat.search(text))

    def test_count_matches_adjacent_identifiers(self):
        pat = load_pattern()
        row = "C0001,김영하,610212-1916489,010-0155-9050,65"
        self.assertEqual(count_matches(pat, row), 2)
        self.assertEqual(count_matches(pat, "610212-1916489,010-0155-9050"), 2)
        self.assertEqual(count_matches(pat, "AKIAABCDEFGHIJKLMNOP 010-0155-9050"), 2)
        self.assertEqual(count_matches(pat, "print(170767500-170886300)"), 0)

    def test_pseudo_has_no_dlp_match_any_file(self):
        targets = sorted((self.data / "pseudo").iterdir())
        self.assertTrue(targets)
        for path in targets:
            with self.subTest(file=path.name):
                orig = path.read_text(encoding="utf-8")
                lines = orig.split("\n")
                if path.suffix == ".json":
                    # Inject into a JSON string value on line 2 (1-based).
                    lines[1] = lines[1].rstrip() + ' "010-0123-4567"'
                    bad_line = 2
                else:
                    # Replace the first cell of the first data row.
                    lines[1] = "010-0123-4567," + lines[1].split(",", 1)[1]
                    bad_line = 2
                path.write_text("\n".join(lines), encoding="utf-8")
                errors = validate(self.data)
                path.write_text(orig, encoding="utf-8")
                self.assertIn("pseudo/%s:%d matches DLP pattern" % (path.name, bad_line), errors)

    def test_raw_has_matches(self):
        shutil.rmtree(self.data / "raw")
        shutil.copytree(self.data / "pseudo", self.data / "raw")
        errors = validate(self.data)
        self.assertTrue(any("raw/ has fewer than 1000 DLP matches" in e for e in errors), errors)

    def test_row_count_mismatch(self):
        path = self.data / "pseudo" / "loans.csv"
        lines = path.read_text(encoding="utf-8").split("\n")
        del lines[2]
        path.write_text("\n".join(lines), encoding="utf-8")
        errors = validate(self.data)
        self.assertTrue(any("row count mismatch in loans.csv" in e for e in errors), errors)

    def test_missing_directory(self):
        shutil.rmtree(self.data / "pseudo")
        self.assertIn("missing directory: pseudo/", validate(self.data))


if __name__ == "__main__":
    unittest.main()
