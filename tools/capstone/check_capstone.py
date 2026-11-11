"""Static checker for the November event capstone pages (20261116/).

Usage: python3 tools/capstone/check_capstone.py [root]
Prints one problem per line, prefixed with the rule name; exit 1 if any.
Standard library only.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

NEW_PAGES = [
    "ClaudeCode_Capstone_Overview.html",
    "ClaudeCode_Capstone_R1A_HandsOnLab.html",
    "ClaudeCode_Capstone_R1B_HandsOnLab.html",
    "ClaudeCode_Capstone_R1C_HandsOnLab.html",
    "ClaudeCode_Capstone_R2_Package_HandsOnLab.html",
    "ClaudeCode_Capstone_R2_1_HandsOnLab.html",
    "ClaudeCode_Capstone_R2_2_HandsOnLab.html",
    "ClaudeCode_Capstone_R2_3_HandsOnLab.html",
]
ARCHIVE_PAGES = [f"ClaudeCode_Capstone{n}_HandsOnLab.html" for n in "1234567"] + [
    f"ClaudeCode_Capstone{n}_HandsOnLab.html" for n in "ABCD"
]
OVERVIEW = NEW_PAGES[0]
R1_PAGES = NEW_PAGES[1:4]
R2_PACKAGE = NEW_PAGES[4]
R2_PAGES = NEW_PAGES[4:]
SETUP_PAGE = "ClaudeCode_Capstone_Setup.html"
BUDGET = {"R1": 110, "R2": 180}
# SETUP (Capstone Setup page) runs at the start of R1 and uses part of its 110 minutes.
SETUP_MINUTES = 15
# The R1-A kit restore must match the Ch3 lab: KIT=${WS_KIT:-<public copy>} (event asset
# snapshot first, read with the instance role) and a signed aws s3 cp.
KIT_REFERENCE = "ClaudeCode_Ch3_HandsOnLab.html"
KIT_LINE_RE = re.compile(r"^\s*KIT=[\"']?((?:\$\{WS_KIT:-)?s3://[^\s\"'<>()}]*mydata-kit\.zip\}?)", re.M)
S3_CP_KIT_RE = re.compile(r"\baws s3 cp\s+((?:--?[\w-]+\s+)*)[\"']?\$\{?KIT\}?[\"']?(?:\s|$)")

SECRET_PATTERNS = [
    re.compile(r"[0-9a-f]{30,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"(?i)(?:api[_-]?key|KEY)\s*[=:]\s*[\"']?([A-Za-z0-9]{16,})"),
]
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}


class Element:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []

    def classes(self):
        return (self.attrs.get("class") or "").split()

    def walk(self):
        yield self
        for c in self.children:
            yield from c.walk()


class _Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("#root", [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        el = Element(tag, attrs, self.cur)
        self.cur.children.append(el)
        if tag not in VOID:
            self.cur = el

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Element(tag, attrs, self.cur))

    def handle_data(self, data):
        self.cur.children.append(Element("#text", [("#text", data)], self.cur))

    def handle_endtag(self, tag):
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent


def parse(path):
    b = _Builder()
    b.feed(path.read_text(encoding="utf-8", errors="replace"))
    return b.root


def elements(root):
    return [e for e in root.walk() if e is not root]


def find_id(root, ident):
    return next((e for e in elements(root) if e.attrs.get("id") == ident), None)


def hrefs_in(el):
    return [e.attrs["href"] for e in el.walk() if e.attrs.get("href")]


def check_exists(root):
    return [f"exists: missing page {n}" for n in NEW_PAGES if not (root / n).is_file()]


def check_links(root, trees):
    msgs = []
    targets = [n for n in NEW_PAGES if (root / n).is_file()] + [
        n for n in ("index.html", SETUP_PAGE) if (root / n).is_file()
    ]
    cache = dict(trees)

    def ids_of(name):
        if name not in cache:
            cache[name] = parse(root / name)
        return {e.attrs["id"] for e in elements(cache[name]) if "id" in e.attrs}

    for name in targets:
        for e in elements(cache.setdefault(name, parse(root / name))):
            for attr in ("href", "src"):
                val = e.attrs.get(attr)
                if not val:
                    continue
                v = val.strip()
                if re.match(r"(?i)^(https?:|mailto:|javascript:|//|data:|tel:)", v) or not v:
                    continue
                path, _, frag = v.partition("#")
                path = path.split("?", 1)[0]
                if not path:
                    if frag and frag not in ids_of(name):
                        msgs.append(f"links: {name}: anchor #{frag} not found in the same file")
                    continue
                target = (root / name).parent / path
                if not target.exists():
                    msgs.append(f"links: {name}: {v} points to a missing file")
                elif frag and target.suffix == ".html":
                    rel = target.resolve().relative_to(root.resolve()).as_posix() \
                        if root.resolve() in target.resolve().parents else None
                    if rel is not None and frag not in ids_of(rel):
                        msgs.append(f"links: {name}: {v} anchor not found in {path}")
    return msgs


def check_overview(root, trees):
    tree = trees.get(OVERVIEW)
    if tree is None:
        return []
    msgs = []
    got = sorted(e.attrs["data-check"] for e in elements(tree)
                 if e.tag == "li" and "data-check" in e.attrs)
    want = [str(i) for i in range(1, 8)]
    if got != want:
        msgs.append(f"overview_checklist: expected <li data-check> 1..7, found {got}")
    if find_id(tree, "submit") is None:
        msgs.append('overview_checklist: missing id="submit" section')
    return msgs


def task_minutes(tree, name, msgs):
    total = 0
    for e in elements(tree):
        if e.tag == "section" and "task" in e.classes():
            raw = (e.attrs.get("data-min") or "").strip()
            if re.fullmatch(r"\d+", raw):
                total += int(raw)
            else:
                msgs.append(f"time_budget: {name}: task {e.attrs.get('id', '(no id)')} "
                            "has missing or non-integer data-min")
    return total


def page_round(tree):
    for e in elements(tree):
        if e.tag == "p" and "round" in e.classes() and e.attrs.get("data-round"):
            return e.attrs["data-round"]
    return None


def check_time_budget(trees):
    msgs = []
    minutes = {}
    for name in R1_PAGES + R2_PAGES:
        if name not in trees:
            continue
        expected = "R1" if name in R1_PAGES else "R2"
        found = page_round(trees[name])
        if found != expected:
            msgs.append(f'time_budget: {name} has no data-round="{expected}" '
                        f"(found {found!r})")
        minutes[name] = task_minutes(trees[name], name, msgs)
    for name in R1_PAGES:
        if name in minutes and minutes[name] + SETUP_MINUTES > BUDGET["R1"]:
            short = name.split("_")[2]
            msgs.append(f"time_budget: {short} is {minutes[name]} min + SETUP "
                        f"{SETUP_MINUTES} = {minutes[name] + SETUP_MINUTES}, "
                        f"over {BUDGET['R1']}")
    if R2_PACKAGE in minutes:
        missions = sorted((minutes[n] for n in R2_PAGES[1:] if n in minutes), reverse=True)
        total = minutes[R2_PACKAGE] + sum(missions[:2])
        if total > BUDGET["R2"]:
            msgs.append(f"time_budget: R2 is {total} min (Package + two largest missions), "
                        f"over {BUDGET['R2']}")
    return msgs


def check_archive(root, trees):
    msgs = []
    for name in ARCHIVE_PAGES:
        path = root / name
        if not path.is_file():
            msgs.append(f"archive: missing archive page {name}")
            continue
        tree = trees.get(name) or parse(path)
        notes = [e for e in elements(tree) if "archive-note" in e.classes()]
        if not notes:
            msgs.append(f'archive: {name} has no class="archive-note"')
        elif not any(OVERVIEW == h.split("#")[0].split("?")[0] for n in notes for h in hrefs_in(n)):
            msgs.append(f"archive: {name} archive-note does not link to {OVERVIEW}")
    return msgs


def check_portal(root):
    index = root / "index.html"
    if not index.is_file():
        return ["portal: index.html is missing"]
    tree = parse(index)
    msgs = []
    for ident, wanted in (("capstones", NEW_PAGES), ("capstone-archive", ARCHIVE_PAGES)):
        el = find_id(tree, ident)
        if el is None:
            msgs.append(f'portal: index.html has no id="{ident}"')
            continue
        have = {h.split("#")[0].split("?")[0] for h in hrefs_in(el)}
        for n in wanted:
            if n not in have:
                msgs.append(f'portal: #{ident} does not link {n}')
    return msgs


def check_secrets(root):
    files = [root / n for n in NEW_PAGES if (root / n).is_file()]
    cap = root / "capstone"
    if cap.is_dir():
        files += sorted(p for p in cap.rglob("*") if p.is_file())
    msgs = []
    for f in files:
        text = f.read_text(encoding="utf-8", errors="ignore")
        rel = f.relative_to(root).as_posix()
        for i, pat in enumerate(SECRET_PATTERNS):
            for m in pat.finditer(text):
                val = m.group(1) if i == 2 else m.group(0)
                if re.search(r"(?i)sample|your|example|dummy|placeholder", val):
                    continue
                msgs.append(f"secret_scan: {rel}: looks like a real key ({m.group(0)[:12]}...)")
                break
    return msgs


def check_guardrail_note(trees):
    tree = trees.get(R2_PACKAGE)
    if tree is None:
        return []
    if not any(e.attrs.get("data-note") == "managed-enforce" for e in elements(tree)):
        return ['guardrail_note: R2 Package page has no data-note="managed-enforce"']
    return []


def text_of(el):
    return "".join(c.attrs.get("#text", "") for c in el.walk())


def check_r1a_restore(root, trees):
    """R1-A step 00 must let a learner without the MyData kit get it back."""
    name = "ClaudeCode_Capstone_R1A_HandsOnLab.html"
    tree = trees.get(name)
    if tree is None:
        return []
    step = find_id(tree, "task-00")
    pres = [e for e in step.walk() if e.tag == "pre"] if step is not None else []
    blob = "\n".join(text_of(e) for e in pres)
    msgs = []
    if step is None:
        return [f'r1a_restore: {name} has no id="task-00" step']
    if "~/claude-lab/mydata/pseudo" not in blob:
        msgs.append(f"r1a_restore: {name} step 00 <pre> does not check ~/claude-lab/mydata/pseudo")
    if "mydata-kit.zip" not in blob:
        msgs.append(f"r1a_restore: {name} step 00 <pre> does not download mydata-kit.zip")
    ref_path = root / KIT_REFERENCE
    ref = None
    if ref_path.is_file():
        ref_pres = "\n".join(text_of(e) for e in elements(parse(ref_path)) if e.tag == "pre")
        ref = KIT_LINE_RE.search(ref_pres)
    if ref is None:
        msgs.append(f"r1a_restore: cannot read the KIT= line from {KIT_REFERENCE}")
    else:
        kits = KIT_LINE_RE.findall(blob)
        if kits != [ref.group(1)]:
            msgs.append(f"r1a_restore: {name} step 00 KIT= {kits} does not match "
                        f"{KIT_REFERENCE} ({ref.group(1)})")
    cps = S3_CP_KIT_RE.findall(blob)
    if not cps or any("--no-sign-request" in flags.split() for flags in cps):
        msgs.append(f'r1a_restore: {name} step 00 must run a signed aws s3 cp "$KIT" (no --no-sign-request)')
    return msgs


def check_r2_3_cleanup(trees):
    """R2-3 must tear down what it deploys and show an ask rule for costly AWS commands."""
    name = "ClaudeCode_Capstone_R2_3_HandsOnLab.html"
    tree = trees.get(name)
    if tree is None:
        return []
    msgs = []
    cleanup = find_id(tree, "cleanup")
    if cleanup is None:
        msgs.append(f'r2_3_cleanup: {name} has no id="cleanup" step')
    elif not any(re.search(r"\b(remove|delete)", text_of(e))
                 for e in cleanup.walk() if e.tag == "pre"):
        msgs.append(f'r2_3_cleanup: {name} cleanup step has no <pre> with a remove or delete command')
    pres = [text_of(e) for e in elements(tree) if e.tag == "pre"]
    if not any('"ask"' in t and "Bash(" in t for t in pres):
        msgs.append(f'r2_3_cleanup: {name} has no <pre> with an "ask" permission rule example')
    return msgs


def check(root):
    root = Path(root)
    trees = {n: parse(root / n) for n in NEW_PAGES + ARCHIVE_PAGES if (root / n).is_file()}
    msgs = []
    msgs += check_exists(root)
    msgs += check_links(root, trees)
    msgs += check_overview(root, trees)
    msgs += check_time_budget(trees)
    msgs += check_archive(root, trees)
    msgs += check_portal(root)
    msgs += check_secrets(root)
    msgs += check_guardrail_note(trees)
    msgs += check_r1a_restore(root, trees)
    msgs += check_r2_3_cleanup(trees)
    return msgs


def main(argv):
    default = Path(__file__).resolve().parents[2] / "20261116"
    root = Path(argv[1]) if len(argv) > 1 else default
    msgs = check(root)
    for m in msgs:
        print(m)
    return 1 if msgs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
