"""Validate generated MyData: pseudo/ has no DLP matches, raw/ has many."""
import csv
import re
import sys
from pathlib import Path

PATTERN_FILE = Path(__file__).with_name("dlp_pattern.txt")
MIN_RAW_MATCHES = 1000


def load_pattern():
    """Compile the one-line ERE; its {m,n} syntax is identical in Python re."""
    return re.compile(PATTERN_FILE.read_text(encoding="utf-8").strip())


def _files(root):
    return {str(p.relative_to(root)): p for p in sorted(root.rglob("*")) if p.is_file()}


def _csv_rows(path):
    with open(path, encoding="utf-8", newline="") as f:
        return sum(1 for _ in csv.reader(f))


def validate(data_dir):
    data_dir = Path(data_dir)
    errors = []
    raw, pseudo = data_dir / "raw", data_dir / "pseudo"
    for d in (raw, pseudo):
        if not d.is_dir():
            errors.append("missing directory: %s/" % d.name)
    if errors:
        return errors
    pat = load_pattern()
    raw_files, pseudo_files = _files(raw), _files(pseudo)
    for name in sorted(set(raw_files) ^ set(pseudo_files)):
        side = "raw/" if name in raw_files else "pseudo/"
        errors.append("file only in %s: %s" % (side, name))

    for name, path in pseudo_files.items():
        with open(path, encoding="utf-8") as f:
            for no, line in enumerate(f, 1):
                if pat.search(line):
                    errors.append("pseudo/%s:%d matches DLP pattern" % (name, no))

    raw_matches = 0
    for path in raw_files.values():
        with open(path, encoding="utf-8") as f:
            raw_matches += sum(len(pat.findall(line)) for line in f)
    if raw_matches < MIN_RAW_MATCHES:
        errors.append("raw/ has fewer than %d DLP matches (found %d)"
                      % (MIN_RAW_MATCHES, raw_matches))

    for name in sorted(set(raw_files) & set(pseudo_files)):
        if name.endswith(".csv"):
            r, p = _csv_rows(raw_files[name]), _csv_rows(pseudo_files[name])
            if r != p:
                errors.append("row count mismatch in %s: raw=%d pseudo=%d" % (name, r, p))
    return errors


def main(argv):
    if len(argv) != 2:
        print("usage: validate.py DATA_DIR", file=sys.stderr)
        return 2
    errors = validate(Path(argv[1]))
    if errors:
        print("\n".join(errors))
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
