"""Guard the lab visual explainers (figure.viz and details.cmd-explain).

Usage: python3 tools/mydata/check_viz.py 20261116
Prints OK, or one error per line, and exits 0 or 1. Standard library only.

Rules:
1. Every <figure class="viz" data-viz="NAME"> names a diagram registered in
   assets/labviz.js. Convention: each diagram is registered with a literal
   call `LabViz.register("NAME", {...})`; the guard reads names with a regex
   over that call, so do not build names dynamically.
2. Every <details class="cmd-explain"> directly follows a <div class="code">
   block (no element in between).
3. Every li[data-lines] range ("3", "2-4", "1,3-4") lies within the line
   count of that block.
4. Every explainer summary says where to paste (contains "붙여넣").
5. Every page that uses either feature links assets/labviz.css and
   assets/labviz.js, and a page with explainers has a copy handler that reads
   the original text from data-raw (`dataset.raw||`).
6. Every icon named in labviz.js (`icon: "NAME"`) exists as
   assets/aws-icons/NAME.svg.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

REGISTER_RE = re.compile(r"""LabViz\.register\(\s*["']([A-Za-z0-9_-]+)["']""")
ICON_RE = re.compile(r"""\bicon\s*:\s*["']([A-Za-z0-9_.-]+)["']""")
COMMENT_RE = re.compile(r"/\*.*?\*/|^\s*//[^\n]*", re.S | re.M)
LINES_RE = re.compile(r"^\d+(-\d+)?(,\d+(-\d+)?)*$")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []  # Node or str
        self.line = 0

    def classes(self):
        return (self.attrs.get("class") or "").split()

    def text(self):
        return "".join(c if isinstance(c, str) else c.text() for c in self.children)

    def elements(self):
        return [c for c in self.children if isinstance(c, Node)]

    def walk(self):
        yield self
        for c in self.elements():
            yield from c.walk()

    def find(self, tag):
        return next((n for n in self.walk() if n.tag == tag and n is not self), None)


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        node.line = self.getpos()[0]
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        node.line = self.getpos()[0]
        self.cur.children.append(node)

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)


def parse(text):
    builder = TreeBuilder()
    builder.feed(text)
    builder.close()
    return builder.root


def line_count(block):
    pre = block.find("pre")
    text = pre.text() if pre else ""
    if text.endswith("\n"):
        text = text[:-1]
    return len(text.split("\n"))


def previous_element(node):
    siblings = node.parent.children
    i = siblings.index(node) - 1
    while i >= 0:
        s = siblings[i]
        if isinstance(s, Node):
            return s
        if s.strip():
            return None  # bare text between block and explainer
        i -= 1
    return None


def check_page(path, names):
    errors = []
    text = path.read_text(encoding="utf-8")
    root = parse(text)
    figures = [n for n in root.walk() if n.tag == "figure" and "viz" in n.classes()]
    explainers = [n for n in root.walk() if n.tag == "details" and "cmd-explain" in n.classes()]
    where = path.name

    for fig in figures:
        name = fig.attrs.get("data-viz") or ""
        if name not in names:
            errors.append('%s:%d: unknown viz "%s"' % (where, fig.line, name))

    for det in explainers:
        prev = previous_element(det)
        if prev is None or prev.tag != "div" or "code" not in prev.classes():
            errors.append("%s:%d: cmd-explain does not follow a .code block" % (where, det.line))
            continue
        summary = det.find("summary")
        if summary is None or "붙여넣" not in summary.text():
            errors.append("%s:%d: cmd-explain summary does not say where to paste" % (where, det.line))
        total = line_count(prev)
        for li in det.walk():
            if li.tag != "li" or "data-lines" not in li.attrs:
                continue
            spec = (li.attrs.get("data-lines") or "").replace(" ", "")
            if not LINES_RE.match(spec):
                errors.append('%s:%d: bad data-lines "%s"' % (where, li.line, spec))
                continue
            for part in spec.split(","):
                lo, _, hi = part.partition("-")
                lo, hi = int(lo), int(hi or lo)
                if lo < 1 or hi > total or lo > hi:
                    errors.append(
                        '%s:%d: data-lines "%s" outside 1-%d' % (where, li.line, spec, total)
                    )
                    break

    if figures or explainers:
        links = [n.attrs.get("href") for n in root.walk() if n.tag == "link"]
        scripts = [n.attrs.get("src") for n in root.walk() if n.tag == "script"]
        if "assets/labviz.css" not in links:
            errors.append("%s: missing assets/labviz.css link" % where)
        if "assets/labviz.js" not in scripts:
            errors.append("%s: missing assets/labviz.js script" % where)
    if explainers and "dataset.raw||" not in text:
        errors.append("%s: copy handler does not read data-raw (dataset.raw||)" % where)
    return errors


def check(labs_dir):
    labs_dir = Path(labs_dir)
    errors = []
    js_path = labs_dir / "assets" / "labviz.js"
    js = js_path.read_text(encoding="utf-8") if js_path.exists() else ""
    js = COMMENT_RE.sub("", js)  # the usage notes in comments are not registrations
    names = set(REGISTER_RE.findall(js))
    for icon in sorted(set(ICON_RE.findall(js))):
        if not (labs_dir / "assets" / "aws-icons" / (icon + ".svg")).is_file():
            errors.append("assets/labviz.js: icon %s.svg missing under assets/aws-icons/" % icon)
    for page in sorted(labs_dir.glob("*.html")):
        errors.extend(check_page(page, names))
    return errors


def main(argv):
    if len(argv) != 2:
        print("usage: check_viz.py LABS_DIR")
        return 2
    errors = check(argv[1])
    for e in errors:
        print(e)
    if not errors:
        print("OK")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
