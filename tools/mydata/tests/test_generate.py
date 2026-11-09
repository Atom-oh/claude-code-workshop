import csv
import re
import tempfile
import unittest
from collections import defaultdict
from pathlib import Path

from tools.mydata.generate import generate

CSV_FILES = [
    "customers.csv", "bank_accounts.csv", "bank_transactions.csv", "cards.csv",
    "card_transactions.csv", "securities.csv", "insurance.csv", "loans.csv",
    "pensions.csv", "card_spend_monthly.csv",
]
ALL_FILES = CSV_FILES + ["mydata_api_sample.json"]
ID_COLS = {"name", "rrn", "mobile", "account_no", "card_no"}


def read(path):
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def snapshot(root):
    return {
        str(p.relative_to(root)): p.read_bytes()
        for p in sorted(root.rglob("*")) if p.is_file()
    }


class GenerateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        cls.root = Path(cls._tmp.name)
        cls.a = cls.root / "a"
        generate(cls.a)

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_deterministic(self):
        b = self.root / "b"
        generate(b)
        self.assertEqual(snapshot(self.a), snapshot(b))
        c = self.root / "c"
        generate(c, seed=1)
        self.assertNotEqual(snapshot(self.a), snapshot(c))

    def test_counts(self):
        self.assertEqual(len(read(self.a / "raw/customers.csv")), 1000)
        total = (len(read(self.a / "raw/bank_transactions.csv"))
                 + len(read(self.a / "raw/card_transactions.csv")))
        self.assertTrue(30000 <= total <= 80000, total)

    def test_raw_pseudo_same_shape(self):
        for name in ALL_FILES:
            self.assertTrue((self.a / "raw" / name).is_file(), name)
            self.assertTrue((self.a / "pseudo" / name).is_file(), name)
        for name in CSV_FILES:
            raw = read(self.a / "raw" / name)
            pseudo = read(self.a / "pseudo" / name)
            self.assertEqual(len(raw), len(pseudo), name)
            if not raw:
                continue
            self.assertEqual(list(raw[0]), list(pseudo[0]), name)
            keep = [c for c in raw[0] if c not in ID_COLS]
            for r, p in zip(raw, pseudo):
                for c in keep:
                    self.assertEqual(r[c], p[c], (name, c))
        pseudo_customers = read(self.a / "pseudo/customers.csv")
        for r in pseudo_customers:
            self.assertRegex(r["name"], r"^고객\d{4}$")
            for c in ("rrn", "mobile"):
                self.assertRegex(r[c], r"^CI_[0-9a-f]{16}$")
        raw_customers = read(self.a / "raw/customers.csv")
        self.assertNotEqual(raw_customers[0]["rrn"], pseudo_customers[0]["rrn"])

    def test_identifier_formats(self):
        for r in read(self.a / "raw/customers.csv"):
            self.assertRegex(r["rrn"], r"^\d{6}-[1-4]9\d{5}$")
            self.assertRegex(r["mobile"], r"^010-0\d{3}-\d{4}$")
        for r in read(self.a / "raw/bank_accounts.csv"):
            self.assertRegex(r["account_no"], r"^\d{3}-\d{6}-\d{5}$")
        for r in read(self.a / "raw/cards.csv"):
            self.assertRegex(r["card_no"], r"^(4111-1111-1111|5555-5555-5555)-\d{4}$")

    def test_dates_and_amounts_never_hyphenated_like_ids(self):
        bad = re.compile(r"\d-\d")
        for tree in ("raw", "pseudo"):
            for name in CSV_FILES:
                for row in read(self.a / tree / name):
                    for col, val in row.items():
                        if col in ID_COLS and tree == "raw":
                            continue
                        self.assertIsNone(bad.search(val), (tree, name, col, val))

    def test_seeded_segments_present(self):
        customers = read(self.a / "raw/customers.csv")
        pensions = defaultdict(lambda: defaultdict(int))
        for r in read(self.a / "raw/pensions.csv"):
            pensions[r["customer_id"]][r["pension_type"]] += int(r["balance"])
        spend = defaultdict(int)
        for r in read(self.a / "raw/card_transactions.csv"):
            spend[r["customer_id"]] += int(r["amount"])
        a = b = c = 0
        for cu in customers:
            cid, age, band = cu["customer_id"], int(cu["age"]), int(cu["income_band"])
            p = pensions.get(cid, {})
            if 40 <= age <= 55 and band >= 9 and p.get("IRP", 0) < 5_000_000:
                a += 1
            ret = sum(p.get(t, 0) for t in ("DB", "DC", "IRP"))
            if 58 <= age <= 64 and ret > 0 and p.get("DB", 0) >= 0.8 * ret:
                b += 1
            if 25 <= age <= 34 and spend[cid] >= 18_000_000 and not p:
                c += 1
        self.assertGreaterEqual(a, 80)
        self.assertGreaterEqual(b, 80)
        self.assertGreaterEqual(c, 80)

    def test_summary_files_small(self):
        for tree in ("raw", "pseudo"):
            for name in ("customers.csv", "pensions.csv", "securities.csv",
                         "insurance.csv", "loans.csv", "card_spend_monthly.csv"):
                self.assertLess((self.a / tree / name).stat().st_size, 300 * 1024, name)
            for name in ("bank_transactions.csv", "card_transactions.csv"):
                self.assertGreater((self.a / tree / name).stat().st_size, 1024 * 1024, name)
        monthly = read(self.a / "raw/card_spend_monthly.csv")
        months = {r["month"] for r in monthly}
        self.assertTrue(months)
        want = defaultdict(int)
        for r in read(self.a / "raw/card_transactions.csv"):
            if r["tx_date"][:6] in months:
                want[r["customer_id"]] += int(r["amount"])
        got = defaultdict(int)
        for r in monthly:
            got[r["customer_id"]] += int(r["amount"])
        self.assertEqual(dict(want), dict(got))


if __name__ == "__main__":
    unittest.main()
