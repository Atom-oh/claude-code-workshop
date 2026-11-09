"""Compute the Ch3 reference segments.md deterministically from the pseudo data.

The lab asks Claude to write this file with three subagents. Claude cannot be run
in CI, so this script produces the same table from the same CSV files; learners
compare their run against checkpoints/ch3/segments.md.

    python3 tools/mydata/make_segments_reference.py \
        --data tools/mydata/dist/data/pseudo --out tools/mydata/checkpoints/ch3/segments.md
"""
import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path

HIGH_SPEND_3M = 5000000  # 3-month card total; roughly 12-month >= 18,000,000 KRW
IRP_MIN = 5000000
RETIREMENT = ("DB", "DC", "IRP")  # excludes 연금저축


def _rows(path):
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def _won(v):
    return "{:,}원".format(int(round(v)))


def _mean(xs):
    return sum(xs) / len(xs) if xs else 0


def compute(pseudo_dir):
    """Return {segment: stats} for segments a, b, c."""
    d = Path(pseudo_dir)
    customers = _rows(d / "customers.csv")
    pension, balance, spend = defaultdict(dict), defaultdict(int), defaultdict(int)
    for r in _rows(d / "pensions.csv"):
        pension[r["customer_id"]][r["pension_type"]] = int(r["balance"])
    for r in _rows(d / "bank_accounts.csv"):
        balance[r["customer_id"]] += int(r["balance"])
    for r in _rows(d / "card_spend_monthly.csv"):
        spend[r["customer_id"]] += int(r["amount"])

    members = {"a": [], "b": [], "c": []}
    for c in customers:
        cid, age, band = c["customer_id"], int(c["age"]), int(c["income_band"])
        p = pension[cid]
        total = sum(p.get(t, 0) for t in RETIREMENT)  # 퇴직연금 = DB + DC + IRP
        if 40 <= age <= 55 and band >= 9 and p.get("IRP", 0) < IRP_MIN:
            members["a"].append((c, p.get("IRP", 0)))
        if 58 <= age <= 64 and total and p.get("DB", 0) * 10 >= total * 8:
            members["b"].append((c, p.get("DB", 0) / total))
        if 25 <= age <= 34 and spend[cid] >= HIGH_SPEND_3M and not p:
            members["c"].append((c, spend[cid]))
    out = {}
    for seg, ms in members.items():
        out[seg] = {
            "count": len(ms),
            "age": _mean([int(c["age"]) for c, _ in ms]),
            "balance": _mean([balance[c["customer_id"]] for c, _ in ms]),
            "metric": _mean([m for _, m in ms]),
        }
    return out


def render(stats):
    a, b, c = stats["a"], stats["b"], stats["c"]
    rows = [
        ("(a) 세액공제 여력 큰 중년 고소득층",
         "40~55세, 소득 구간 상위 2개(9~10), IRP 없음 또는 잔액 500만 원 미만",
         a, "평균 IRP 잔액 " + _won(a["metric"])),
        ("(b) 퇴직을 앞둔 DB형 가입자",
         "58~64세, 퇴직연금(DB·DC·IRP) 잔액 중 DB형 비중 80% 이상",
         b, "평균 DB형 비중 {:.0f}%".format(b["metric"] * 100)),
        ("(c) 소비는 크지만 연금 저축이 없는 청년층",
         "25~34세, 최근 3개월 카드 사용액 상위(합계 500만 원 이상), 연금 저축 없음",
         c, "3개월 평균 카드 사용액 " + _won(c["metric"])),
    ]
    lines = [
        "# 고객 세그먼트 제안",
        "",
        "기준: pseudo/ 가명 데이터. 카드 소비는 최근 3개월 월별 요약, 금액 단위는 원입니다.",
        "",
        "| 세그먼트 | 정의 | 고객 수 | 평균 나이 | 평균 계좌 잔액 | 대표 지표 |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for name, definition, s, metric in rows:
        lines.append("| %s | %s | %d명 | %.1f세 | %s | %s |"
                     % (name, definition, s["count"], s["age"], _won(s["balance"]), metric))
    lines += [
        "",
        "## 맞춤 서비스 제안",
        "",
        "- (a) 세액공제 한도를 안내하고 IRP 개설을 제안합니다.",
        "- (b) 퇴직 시 IRP 이전을 안내하고 연금 수령 방식을 함께 설계합니다.",
        "- (c) 소액 자동이체형 연금저축을 제안합니다.",
        "",
        "## 근거",
        "",
        "- 소비: pseudo/card_spend_monthly.csv, 연령: pseudo/customers.csv",
        "- 연금: pseudo/pensions.csv, 계좌 잔액: pseudo/bank_accounts.csv",
        "- 개별 고객 ID와 토큰 값은 싣지 않았습니다.",
        "",
    ]
    return "\n".join(lines)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--data", required=True, help="pseudo/ directory")
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)
    Path(args.out).write_text(render(compute(args.data)), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
