import tempfile
import unittest
from pathlib import Path

from tools.mydata.generate import generate
from tools.mydata.make_segments_reference import compute, render
from tools.mydata.validate import load_pattern

REFERENCE = Path(__file__).resolve().parents[1] / "checkpoints" / "ch3" / "segments.md"


class SegmentsReferenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        generate(Path(cls._tmp.name))
        cls.stats = compute(Path(cls._tmp.name) / "pseudo")

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_seeded_segments_are_found(self):
        # Quotas seeded in generate.py: 120 / 100 / 120; others may add a few.
        self.assertGreaterEqual(self.stats["a"]["count"], 120)
        self.assertGreaterEqual(self.stats["b"]["count"], 100)
        self.assertGreaterEqual(self.stats["c"]["count"], 120)

    def test_exact_counts_for_default_seed(self):
        # (b) denominator is DB + DC + IRP only; 연금저축 is excluded (ruling R14).
        self.assertEqual(
            [self.stats[k]["count"] for k in "abc"], [149, 121, 120])

    def test_segment_profiles_match_definitions(self):
        self.assertTrue(40 <= self.stats["a"]["age"] <= 55)
        self.assertTrue(58 <= self.stats["b"]["age"] <= 64)
        self.assertTrue(25 <= self.stats["c"]["age"] <= 34)

    def test_output_has_no_dlp_match(self):
        self.assertIsNone(load_pattern().search(render(self.stats)))

    def test_checkpoint_is_in_sync(self):
        self.assertEqual(REFERENCE.read_text(encoding="utf-8"), render(self.stats))


if __name__ == "__main__":
    unittest.main()
