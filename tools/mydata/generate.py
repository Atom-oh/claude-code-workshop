"""Seeded synthetic Korean MyData generator (stdlib only).

Writes ``raw/`` (fake identifiers) and ``pseudo/`` (identifiers replaced by
HMAC tokens) with identical file names. Every identifier is a format-only fake
value: card numbers use test ranges, RRN serials start with 9, mobile numbers
use the unassigned 0 exchange prefix.

CLI: python3 tools/mydata/generate.py --out tools/mydata/dist/data
"""
import argparse
import csv
import hashlib
import hmac
import json
import random
from pathlib import Path

DEFAULT_SEED = 20261116
N_CUSTOMERS = 1000
REF_YEAR = 2026
# 12 months of history, 202511..202610; the monthly summary covers the last 3.
MONTHS = [(2025, 11), (2025, 12)] + [(2026, m) for m in range(1, 11)]
SUMMARY_MONTHS = 3

ID_COLS = ("name", "rrn", "mobile", "account_no", "card_no")
SURNAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]
GIVEN = ["민", "서", "지", "현", "준", "우", "하", "은", "도", "윤", "수", "영", "진", "아", "태"]
REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "강원", "제주"]
BANKS = ["가나은행", "다라은행", "마바은행", "사아은행"]
ISSUERS = ["가나카드", "다라카드", "마바카드"]
CATEGORIES = ["식비", "마트", "교통", "쇼핑", "여가", "의료", "통신", "교육", "주유"]
BANK_OUT = ["공과금", "월세", "이체", "보험료", "대출상환", "생활비"]


def _date(y, m, d):
    return "%04d%02d%02d" % (y, m, d)


def _round(v, unit):
    return int(round(v / unit)) * unit


def _build_customers(rng):
    """Customers carry a segment drawn by quota; every other table derives
    from the profile rules, never from post-hoc edits."""
    order = rng.sample(range(N_CUSTOMERS), 340)
    seg = {}
    for i, idx in enumerate(order):
        seg[idx] = "a" if i < 120 else ("b" if i < 220 else "c")
    mobiles = rng.sample(range(10000000), N_CUSTOMERS)
    customers = []
    for i in range(N_CUSTOMERS):
        s = seg.get(i, "")
        if s == "a":
            age, band = rng.randint(40, 55), rng.choice([9, 10])
        elif s == "b":
            age, band = rng.randint(58, 64), rng.randint(4, 8)
        elif s == "c":
            age, band = rng.randint(25, 34), rng.randint(5, 8)
        else:
            age, band = rng.randint(22, 68), rng.randint(1, 10)
        year = REF_YEAR - age
        male = rng.random() < 0.5
        gcode = (1 if male else 2) if year < 2000 else (3 if male else 4)
        rrn = "%02d%02d%02d-%d9%05d" % (year % 100, rng.randint(1, 10), rng.randint(1, 28),
                                        gcode, rng.randint(0, 99999))
        name = rng.choice(SURNAMES) + rng.choice(GIVEN) + rng.choice(GIVEN)
        mob = "%07d" % mobiles[i]
        customers.append({
            "customer_id": "C%04d" % (i + 1), "name": name, "rrn": rrn,
            "mobile": "010-0%s-%s" % (mob[:3], mob[3:]),
            "age": age, "gender": "M" if male else "F",
            "region": rng.choice(REGIONS), "income_band": band,
            "joined_date": _date(rng.randint(2015, 2025), rng.randint(1, 12), rng.randint(1, 28)),
            "_seg": s,
        })
    return customers


def _build_pensions(rng, customers):
    rows = []
    for c in customers:
        s, cid = c["_seg"], c["customer_id"]
        if s == "c":
            continue  # segment (c): no pension savings at all
        types = {}
        if s == "b":
            db = rng.randint(30, 120) * 1000000
            types["DB"] = db
            if rng.random() < 0.6:
                types["DC"] = rng.randint(0, db // 20 // 10000) * 10000
            if rng.random() < 0.6:
                types["IRP"] = rng.randint(0, db // 20 // 10000) * 10000
        elif s == "a":
            if rng.random() < 0.5:
                types["IRP"] = rng.randint(10, 490) * 10000  # < 5,000,000
            if rng.random() < 0.5:
                types["연금저축"] = rng.randint(5, 80) * 1000000
        else:
            for t in ("DB", "DC", "IRP", "연금저축"):
                if rng.random() < 0.3:
                    types[t] = rng.randint(1, 100) * 1000000
        for t, bal in types.items():
            rows.append({"customer_id": cid, "pension_type": t, "balance": bal,
                         "monthly_contribution": _round(bal / 120, 10000)})
    return rows


def _tables(seed):
    rng = random.Random(seed)
    customers = _build_customers(rng)
    pensions = _build_pensions(rng, customers)

    accounts, cards = [], []
    acc_nos = rng.sample(range(10 ** 6), N_CUSTOMERS * 2)
    card_nos = rng.sample(range(10000), 2 * 2500)
    ai = ci = 0
    first_acc, cust_cards = {}, {}
    for c in customers:
        cid = c["customer_id"]
        for k in range(rng.choice([1, 1, 2])):
            n = acc_nos[ai]
            accounts.append({
                "account_id": "A%05d" % (ai + 1), "customer_id": cid,
                "account_no": "%03d-%06d-%05d" % (rng.randint(100, 999), n, rng.randint(0, 99999)),
                "bank": rng.choice(BANKS), "account_type": rng.choice(["입출금", "예금", "적금"]),
                "balance": rng.randint(1, 3000) * 10000,
                "opened_date": _date(rng.randint(2012, 2025), rng.randint(1, 12), rng.randint(1, 28)),
            })
            first_acc.setdefault(cid, accounts[-1]["account_id"])
            ai += 1
        for k in range(rng.choice([1, 1, 2])):
            prefix = rng.choice(["4111-1111-1111", "5555-5555-5555"])
            cards.append({
                "card_id": "K%05d" % (ci + 1), "customer_id": cid,
                "card_no": "%s-%04d" % (prefix, card_nos[ci % len(card_nos)]),
                "card_type": rng.choice(["신용", "체크"]), "issuer": rng.choice(ISSUERS),
                "issued_date": _date(rng.randint(2016, 2025), rng.randint(1, 12), rng.randint(1, 28)),
            })
            cust_cards.setdefault(cid, []).append(cards[-1]["card_id"])
            ci += 1
    # Card numbers must be unique within a prefix; fix collisions deterministically.
    seen = set()
    for card in cards:
        while card["card_no"] in seen:
            card["card_no"] = card["card_no"][:-4] + "%04d" % rng.randint(0, 9999)
        seen.add(card["card_no"])

    bank_tx, card_tx = [], []
    for c in customers:
        cid, band = c["customer_id"], c["income_band"]
        acc = first_acc[cid]
        salary = _round((2000000 + band * 500000) * rng.uniform(0.9, 1.1), 1000)
        if c["_seg"] == "c":
            level = rng.uniform(2000000, 3500000)  # high card spend
        else:
            level = (200000 + band * 120000) * rng.uniform(0.5, 1.2)
        prefs = rng.sample(CATEGORIES, 3)
        for (y, m) in MONTHS:
            bank_tx.append({"tx_id": "B%06d" % (len(bank_tx) + 1), "customer_id": cid,
                            "account_id": acc, "tx_date": _date(y, m, 25), "tx_type": "IN",
                            "description": "급여", "amount": salary})
            for _ in range(rng.choice([1, 2])):
                bank_tx.append({"tx_id": "B%06d" % (len(bank_tx) + 1), "customer_id": cid,
                                "account_id": acc, "tx_date": _date(y, m, rng.randint(1, 28)),
                                "tx_type": "OUT", "description": rng.choice(BANK_OUT),
                                "amount": _round(salary * rng.uniform(0.05, 0.4), 1000)})
            n = rng.randint(2, 4)
            total = level * rng.uniform(0.9, 1.1)
            w = [rng.uniform(0.5, 1.5) for _ in range(n)]
            for wi in w:
                card_tx.append({"tx_id": "T%06d" % (len(card_tx) + 1), "customer_id": cid,
                                "card_id": rng.choice(cust_cards[cid]),
                                "tx_date": _date(y, m, rng.randint(1, 28)),
                                "merchant_category": rng.choice(prefs),
                                "merchant_id": "M%04d" % rng.randint(1, 500),
                                "amount": max(100, _round(total * wi / sum(w), 100))})

    securities, insurance, loans = [], [], []
    for c in customers:
        cid = c["customer_id"]
        if rng.random() < 0.5:
            securities.append({"customer_id": cid,
                               "product_type": rng.choice(["국내주식", "해외주식", "펀드", "ETF"]),
                               "market_value": rng.randint(1, 500) * 100000,
                               "opened_date": _date(rng.randint(2015, 2025), rng.randint(1, 12), rng.randint(1, 28))})
        if rng.random() < 0.7:
            for _ in range(rng.choice([1, 2])):
                insurance.append({"customer_id": cid,
                                  "policy_type": rng.choice(["실손", "종신", "정기", "연금", "운전자"]),
                                  "monthly_premium": rng.randint(3, 40) * 10000,
                                  "start_date": _date(rng.randint(2010, 2025), rng.randint(1, 12), rng.randint(1, 28)),
                                  "status": rng.choice(["유지", "유지", "유지", "만기"])})
        if rng.random() < 0.4:
            principal = rng.randint(5, 500) * 1000000
            loans.append({"customer_id": cid,
                          "loan_type": rng.choice(["주택담보", "신용", "자동차", "전세자금"]),
                          "principal": principal, "balance": int(principal * rng.uniform(0.2, 1.0)) // 1000 * 1000,
                          "rate_bp": rng.randint(250, 750),
                          "start_date": _date(rng.randint(2016, 2025), rng.randint(1, 12), rng.randint(1, 28))})

    covered = ["%04d%02d" % ym for ym in MONTHS[-SUMMARY_MONTHS:]]
    agg = {}
    for t in card_tx:
        mon = t["tx_date"][:6]
        if mon in covered:
            key = (t["customer_id"], mon, t["merchant_category"])
            agg[key] = agg.get(key, 0) + t["amount"]
    monthly = [{"customer_id": k[0], "month": k[1], "merchant_category": k[2], "amount": v}
               for k, v in sorted(agg.items())]

    for c in customers:
        del c["_seg"]
    return {
        "customers": customers, "bank_accounts": accounts,
        "bank_transactions": bank_tx, "cards": cards, "card_transactions": card_tx,
        "securities": securities, "insurance": insurance, "loans": loans,
        "pensions": pensions, "card_spend_monthly": monthly,
    }


def _pseudonymize(tables, seed):
    key = hashlib.sha256(("mydata-pseudo-%d" % seed).encode()).digest()

    def token(v):
        return "CI_" + hmac.new(key, v.encode(), hashlib.sha256).hexdigest()[:16]

    out = {}
    for name, rows in tables.items():
        new = []
        for r in rows:
            r = dict(r)
            for col in ID_COLS:
                if col in r:
                    r[col] = ("고객%s" % r["customer_id"][1:]) if col == "name" else token(r[col])
            new.append(r)
        out[name] = new
    return out


def _api_sample(tables):
    sample = []
    for c in tables["customers"][:3]:
        cid = c["customer_id"]
        sample.append({
            "customer": c,
            "accounts": [a for a in tables["bank_accounts"] if a["customer_id"] == cid],
            "cards": [k for k in tables["cards"] if k["customer_id"] == cid],
        })
    return {"api": "mydata/v1/sample", "results": sample}


def _write(root, tables):
    root.mkdir(parents=True, exist_ok=True)
    for name, rows in tables.items():
        with open(root / (name + ".csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, lineterminator="\n")
            header = list(rows[0]) if rows else []
            w.writerow(header)
            for r in rows:
                w.writerow([r[h] for h in header])
    with open(root / "mydata_api_sample.json", "w", encoding="utf-8") as f:
        json.dump(_api_sample(tables), f, ensure_ascii=False, indent=2)
        f.write("\n")


def generate(out_dir, seed=DEFAULT_SEED):
    out_dir = Path(out_dir)
    raw = _tables(seed)
    _write(out_dir / "raw", raw)
    _write(out_dir / "pseudo", _pseudonymize(raw, seed))


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", required=True)
    ap.add_argument("--seed", type=int, default=DEFAULT_SEED)
    args = ap.parse_args()
    generate(Path(args.out), args.seed)
