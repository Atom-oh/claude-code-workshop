"""Guard the workshop lab pages against drift from the MyData kit."""
import html
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

if __package__ in (None, ""):  # run as a script: python3 tools/mydata/check_labs.py
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.mydata.build import manifest as kit_manifest
from tools.mydata.validate import load_pattern

PREFLIGHT = "ClaudeCode_Preflight_Check.html"
CHAPTERS = [
    "ClaudeCode_Ch1_HandsOnLab.html",
    "ClaudeCode_Ch2_HandsOnLab.html",
    "ClaudeCode_Ch2_Guardrails_HandsOnLab.html",
    "ClaudeCode_Ch3_HandsOnLab.html",
    "ClaudeCode_Ch4_HandsOnLab.html",
    "ClaudeCode_Ch5_HandsOnLab.html",
    "ClaudeCode_Ch6_HandsOnLab.html",
]
PAGES = [PREFLIGHT] + CHAPTERS

# Rule 3: checkpoint folders each chapter's TASK 00 must restore.
RESTORE = {
    "ClaudeCode_Ch4_HandsOnLab.html": ["ch2/", "ch3/"],
    "ClaudeCode_Ch5_HandsOnLab.html": ["ch4/"],
}
# Rule 5: pages that must stay on pseudo/ aggregate files only.
NO_TRANSACTIONS = ["ClaudeCode_Ch1_HandsOnLab.html", "ClaudeCode_Ch3_HandsOnLab.html"]
TRANSACTION_FILES = ["bank_transactions.csv", "card_transactions.csv"]

MYDATA = "~/claude-lab/mydata"
MYDATA_RE = re.compile(re.escape(MYDATA) + r"(/[A-Za-z0-9_./*-]*)?")
KIT_URL_RE = re.compile(r"https?://[^\s\"'<>()]*mydata-kit\.zip")
PAT_RE = re.compile(r"PAT='([^']*)'")
H2_RE = re.compile(r"<h2\b[^>]*>(.*?)</h2>", re.S)
MINUTES_RE = re.compile(r"\((\d+)\s*분\)\s*$")
GUARDRAILS = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"


def _text(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def _sections(raw):
    """Yield (heading_text, body_html) for each <h2> section."""
    marks = list(H2_RE.finditer(raw))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(raw)
        yield _text(m.group(1)), raw[m.end():end]


def required_minutes(raw):
    """Return (sum of required-task minutes, headings without parsable minutes)."""
    total, bad = 0, []
    for heading, _ in _sections(raw):
        if not heading.startswith(("TASK", "선택 TASK")):
            continue
        m = MINUTES_RE.search(heading)
        if not m:
            bad.append(heading)
        elif heading.startswith("TASK"):
            total += int(m.group(1))
    return total, bad


def _rev_exists(repo_root, rev):
    r = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", "%s^{commit}" % rev],
        cwd=repo_root, capture_output=True, text=True,
    )
    return r.returncode == 0


def _baseline_page(repo_root, rev, name):
    r = subprocess.run(
        ["git", "show", "%s:20261116/%s" % (rev, name)],
        cwd=repo_root, capture_output=True, text=True, encoding="utf-8",
    )
    return r.stdout if r.returncode == 0 else None


def _path_known(path, entries):
    path = path.rstrip(".")  # sentence-ending period is not part of the path
    if path in ("", "/"):
        return True
    if path.endswith("/") or "*" in path:
        prefix = path.split("*")[0].lstrip("/")
        return any(e.startswith(prefix) for e in entries)
    rel = path.lstrip("/")
    return rel in entries or any(e.startswith(rel + "/") for e in entries)


def check(labs_dir, manifest, baseline_rev="1c58d26"):
    labs_dir = Path(labs_dir)
    entries = set(manifest)
    expected_pat = load_pattern().pattern
    errors, urls = [], {}
    baseline_ok = _rev_exists(labs_dir.parent, baseline_rev)
    if not baseline_ok:
        errors.append("rule 4: baseline %s not found" % baseline_rev)
    for name in PAGES:
        path = labs_dir / name
        if not path.is_file():
            errors.append("%s: missing lab page" % name)
            continue
        raw = path.read_text(encoding="utf-8")
        text = html.unescape(raw)

        def err(rule, msg, name=name):
            errors.append("%s: rule %d: %s" % (name, rule, msg))

        for m in MYDATA_RE.finditer(text):  # rule 1
            if not _path_known(m.group(1) or "", entries):
                err(1, "unknown MyData path %s" % m.group(0).rstrip("."))
        for pat in PAT_RE.findall(text):  # rule 2
            if pat != expected_pat:
                err(2, "PAT differs from dlp_pattern.txt: %s" % pat)
        if name == GUARDRAILS and not PAT_RE.search(text):
            err(2, "no PAT='...' found")

        found = set(KIT_URL_RE.findall(text))
        urls[name] = found
        if name == PREFLIGHT:  # rule 3 (fallback only)
            if not ("curl" in text and found):
                err(3, "no curl re-download of mydata-kit.zip")
        else:
            task00 = next((body for h, body in _sections(raw) if h.startswith("TASK 00")), None)
            if task00 is None:
                err(3, "no TASK 00 section")
            else:
                t00 = html.unescape(task00)
                for ck in RESTORE.get(name, []):
                    if "%s/checkpoints/%s" % (MYDATA, ck) not in t00:
                        err(3, "TASK 00 lacks restore of %s/checkpoints/%s" % (MYDATA, ck))
                if not ("curl" in t00 and KIT_URL_RE.search(t00)):
                    err(3, "TASK 00 lacks curl re-download of mydata-kit.zip")

        if name != PREFLIGHT:  # rule 4
            now, bad = required_minutes(raw)
            for h in bad:
                err(4, "cannot parse minutes in heading: %s" % h)
            base = _baseline_page(labs_dir.parent, baseline_rev, name) if baseline_ok else None
            if base is not None:
                then = required_minutes(base)[0]
                if now > then:
                    err(4, "required TASK minutes %d exceed baseline %d" % (now, then))
        if name in NO_TRANSACTIONS:  # rule 5
            for f in TRANSACTION_FILES:
                if f in text:
                    err(5, "references %s" % f)

    distinct = sorted(set().union(*urls.values())) if urls else []  # rule 6
    if len(distinct) > 1:
        for name, found in urls.items():
            if found:
                errors.append(
                    "%s: rule 6: kit URL %s differs across pages (%s)"
                    % (name, ", ".join(sorted(found)), " vs ".join(distinct))
                )
    return errors


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 2:
        print("usage: check_labs.py <labs_dir> <mydata-kit.zip>", file=sys.stderr)
        return 2
    errors = check(Path(argv[0]), kit_manifest(argv[1]))
    print("\n".join(errors) if errors else "OK")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
