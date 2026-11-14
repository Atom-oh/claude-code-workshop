"""Guard the workshop lab pages against drift from the MyData kit."""
import html
import re
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
KIT_URI_RE = re.compile(r"s3://[^\s\"'<>()]*mydata-kit\.zip")
# Rule 6: leftovers of the retired curl/signed-URL download.
STALE_URL_RE = re.compile(r"https?://[^\s\"'<>()]*(?:MYDATA_KIT_URL|mydata-kit\.zip)")
CURL_KIT_RE = re.compile(r"\bcurl\b.*mydata-kit\.zip")
PRE_RE = re.compile(r"<pre\b[^>]*>(.*?)</pre>", re.S)
KIT_VAR_RE = re.compile(r"^\s*KIT=[\"']?(?:\$\{WS_KIT:-)?" + KIT_URI_RE.pattern, re.M)
# Rule 7: KIT= prefers the event asset snapshot (WS_KIT, private, read with the instance role)
# and falls back to the public copy, which only refreshes on publish. The download is signed.
EVENT_KIT_RE = re.compile(r"^\s*KIT=\$\{WS_KIT:-" + KIT_URI_RE.pattern + r"\}\s*$", re.M)
S3_CP_RE = re.compile(r"\baws s3 cp\b")
S3_CP_VAR_RE = re.compile(r"\baws s3 cp\s+(?:--?[\w-]+\s+)*[\"']?\$\{?KIT\}?[\"']?(?:\s|$)")
# Rule 4: session times live in the eDM (eDM.html timetable), not on the lab pages. A lab page
# states no minutes in its TASK/CHECK headings and has no "소요 시간" line.
PAT_RE = re.compile(r"PAT='([^']*)'")
H2_RE = re.compile(r"<h2\b[^>]*>(.*?)</h2>", re.S)
STATED_MINUTES_RE = re.compile(r"\d+\s*분(?![기위할석류])")  # minutes, not 1분기 / 5분위 / 2분할
# Session-length prose outside code: "55분 실습 세션", "7분 프리플라이트", "20분 랩".
SESSION_PROSE_RE = re.compile(r"\d+\s*분\s*(?:짜리\s*)?(?:실습|프리플라이트|세션|랩)")
CODE_RE = re.compile(r"<(pre|code)\b.*?</\1>", re.S)
TIMED_HEADING = ("TASK", "선택 TASK", "CHECK")
GUARDRAILS = "ClaudeCode_Ch2_Guardrails_HandsOnLab.html"


def _text(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def code_blocks(fragment):
    """Unescaped <pre> contents with backslash line continuations joined."""
    blocks = []
    for m in PRE_RE.finditer(fragment):
        block = html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))
        blocks.append(re.sub(r"\\[ \t]*\n\s*", " ", block))
    return blocks


def downloads_kit(fragment):
    """True if a code block runs aws s3 cp on the kit object itself."""
    for block in code_blocks(fragment):
        for line in block.splitlines():
            if S3_CP_RE.search(line) and KIT_URI_RE.search(line):
                return True
        if KIT_VAR_RE.search(block) and S3_CP_VAR_RE.search(block):
            return True
    return False


def has_stale_download(fragment):
    if STALE_URL_RE.search(html.unescape(fragment)):
        return True
    return any(CURL_KIT_RE.search(line) for b in code_blocks(fragment) for line in b.splitlines())


def _sections(raw):
    """Yield (heading_text, body_html) for each <h2> section."""
    marks = list(H2_RE.finditer(raw))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(raw)
        yield _text(m.group(1)), raw[m.end():end]


def stated_minutes(raw):
    """Return headings (TASK, 선택 TASK, CHECK) that still state minutes, e.g. "(5분)"."""
    return [h for h, _ in _sections(raw) if h.startswith(TIMED_HEADING) and STATED_MINUTES_RE.search(h)]


def session_prose(raw):
    """Return session-length phrases in the page text outside <pre>/<code>."""
    return [m.group(0) for m in SESSION_PROSE_RE.finditer(_text(CODE_RE.sub(" ", raw)))]


def _path_known(path, entries):
    path = path.rstrip(".")  # sentence-ending period is not part of the path
    if path in ("", "/"):
        return True
    if path.endswith("/") or "*" in path:
        prefix = path.split("*")[0].lstrip("/")
        return any(e.startswith(prefix) for e in entries)
    rel = path.lstrip("/")
    return rel in entries or any(e.startswith(rel + "/") for e in entries)


def check(labs_dir, manifest):
    labs_dir = Path(labs_dir)
    entries = set(manifest)
    expected_pat = load_pattern().pattern
    errors, urls = [], {}
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

        for block in code_blocks(raw):  # rule 7
            for line in block.splitlines():
                if KIT_VAR_RE.match(line) and not EVENT_KIT_RE.match(line):
                    err(7, "KIT= must be the unquoted ${WS_KIT:-<public kit URI>}: %s" % line.strip())
            for line in block.splitlines():
                if (S3_CP_RE.search(line) and "--no-sign-request" in line
                        and (re.search(r"\$\{?KIT\b", line) or KIT_URI_RE.search(line))):
                    err(7, "aws s3 cp of the kit must be signed (no --no-sign-request)")
                    break
        found = set(KIT_URI_RE.findall(text))
        urls[name] = found
        if has_stale_download(raw):  # rule 6
            err(6, "stale curl kit download")
        if name == PREFLIGHT:  # rule 3 (fallback only)
            if not downloads_kit(raw):
                err(3, "no aws s3 cp of mydata-kit.zip")
        else:
            task00 = next((body for h, body in _sections(raw) if h.startswith("TASK 00")), None)
            if task00 is None:
                err(3, "no TASK 00 section")
            else:
                t00 = html.unescape(task00)
                for ck in RESTORE.get(name, []):
                    if "%s/checkpoints/%s" % (MYDATA, ck) not in t00:
                        err(3, "TASK 00 lacks restore of %s/checkpoints/%s" % (MYDATA, ck))
                if not downloads_kit(task00):
                    err(3, "TASK 00 lacks aws s3 cp of mydata-kit.zip")

        for h in stated_minutes(raw):  # rule 4
            err(4, "heading states minutes (times come from the eDM): %s" % h)
        if "소요 시간" in text:
            err(4, "states 소요 시간 (times come from the eDM)")
        for phrase in session_prose(raw):
            err(4, "states a session length (times come from the eDM): %s" % phrase)
        if name in NO_TRANSACTIONS:  # rule 5
            for f in TRANSACTION_FILES:
                if f in text:
                    err(5, "references %s" % f)

    distinct = sorted(set().union(*urls.values())) if urls else []  # rule 6
    if len(distinct) > 1:
        for name, found in urls.items():
            if found:
                errors.append(
                    "%s: rule 6: kit URI %s differs across pages (%s)"
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
