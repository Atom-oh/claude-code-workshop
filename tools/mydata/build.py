"""Pack generated MyData and chapter checkpoints into one reproducible kit zip."""
import argparse
import hashlib
import sys
import zipfile
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.mydata.generate import generate
from tools.mydata.validate import validate

HERE = Path(__file__).resolve().parent
FIXED_TIME = (2026, 11, 16, 0, 0, 0)


def _collect(data_dir, checkpoints_dir):
    """Return {zip path: bytes} for every file in the kit except SHA256SUMS."""
    files = {}
    for top in ("raw", "pseudo"):
        for p in sorted((data_dir / top).rglob("*")):
            if p.is_file():
                files["%s/%s" % (top, p.relative_to(data_dir / top).as_posix())] = p
    if checkpoints_dir.is_dir():
        for p in sorted(checkpoints_dir.rglob("*")):
            if p.is_file() and p.name != ".keep":
                files["checkpoints/" + p.relative_to(checkpoints_dir).as_posix()] = p
    return files


def build_kit(data_dir, checkpoints_dir, out_zip, version):
    data_dir, checkpoints_dir, out_zip = Path(data_dir), Path(checkpoints_dir), Path(out_zip)
    errors = validate(data_dir)
    if errors:
        raise ValueError("MyData validation failed:\n" + "\n".join(errors))
    entries = {name: p.read_bytes() for name, p in _collect(data_dir, checkpoints_dir).items()}
    modes = {name: 0o755 if name.endswith(".sh") else 0o644 for name in entries}
    entries["VERSION"] = (version + "\n").encode("utf-8")
    modes["VERSION"] = 0o644
    sums = "".join(
        "%s  %s\n" % (hashlib.sha256(entries[n]).hexdigest(), n) for n in sorted(entries)
    )
    entries["SHA256SUMS"] = sums.encode("utf-8")
    modes["SHA256SUMS"] = 0o644

    out_zip.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as z:
        for name in sorted(entries):
            info = zipfile.ZipInfo(name, date_time=FIXED_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3  # Unix, so external_attr carries the mode
            info.external_attr = (0o100000 | modes[name]) << 16
            z.writestr(info, entries[name])
    return out_zip


def manifest(zip_path):
    with zipfile.ZipFile(zip_path) as z:
        return {n for n in z.namelist() if not n.endswith("/")}


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--version", required=True)
    ap.add_argument("--data", default=str(HERE / "dist" / "data"))
    ap.add_argument("--checkpoints", default=str(HERE / "checkpoints"))
    ap.add_argument("--out", default=str(HERE / "dist" / "mydata-kit.zip"))
    args = ap.parse_args(argv)
    data = Path(args.data)
    generate(data)
    out = build_kit(data, Path(args.checkpoints), Path(args.out), args.version)
    print(hashlib.sha256(out.read_bytes()).hexdigest(), out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
