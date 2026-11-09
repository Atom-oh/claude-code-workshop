import hashlib
import shutil
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path

from tools.mydata.build import build_kit, manifest
from tools.mydata.generate import generate


class BuildTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        root = Path(cls._tmp.name)
        cls.data = root / "data"
        generate(cls.data)
        cls.ckpt = root / "checkpoints"
        (cls.ckpt / "ch2").mkdir(parents=True)
        (cls.ckpt / ".keep").write_text("")
        sh = cls.ckpt / "ch2" / "dlp-guard.sh"
        sh.write_text("#!/bin/sh\necho guard\n")
        sh.chmod(0o755)
        (cls.ckpt / "ch2" / "notes.txt").write_text("note\n")
        cls.zip = build_kit(cls.data, cls.ckpt, root / "kit.zip", "2026.11.1")

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_build_contains_layout(self):
        paths = manifest(self.zip)
        self.assertIn("SHA256SUMS", paths)
        self.assertIn("VERSION", paths)
        self.assertIn("checkpoints/ch2/dlp-guard.sh", paths)
        self.assertNotIn("checkpoints/.keep", paths)
        for p in paths:
            self.assertFalse(p.endswith("/"), p)
        for top in ("raw", "pseudo"):
            self.assertTrue(any(p.startswith(top + "/") for p in paths), top)
        with zipfile.ZipFile(self.zip) as z:
            self.assertEqual(z.read("VERSION"), b"2026.11.1\n")

    def test_sha256sums_verify(self):
        with zipfile.ZipFile(self.zip) as z:
            lines = z.read("SHA256SUMS").decode().splitlines()
            listed = {}
            for line in lines:
                digest, path = line.split("  ", 1)
                listed[path] = digest
                self.assertEqual(hashlib.sha256(z.read(path)).hexdigest(), digest, path)
        self.assertEqual(set(listed), manifest(self.zip) - {"SHA256SUMS"})
        self.assertEqual([l.split("  ", 1)[1] for l in lines], sorted(listed))

    def test_refuses_invalid_data(self):
        bad = Path(self._tmp.name) / "bad"
        shutil.copytree(self.data, bad)
        shutil.rmtree(bad / "raw")
        out = Path(self._tmp.name) / "bad.zip"
        with self.assertRaises(ValueError):
            build_kit(bad, self.ckpt, out, "x")
        self.assertFalse(out.exists())

    def test_shell_scripts_executable(self):
        with zipfile.ZipFile(self.zip) as z:
            mode = z.getinfo("checkpoints/ch2/dlp-guard.sh").external_attr >> 16
            self.assertEqual(stat.S_IMODE(mode), 0o755)
            mode = z.getinfo("VERSION").external_attr >> 16
            self.assertEqual(stat.S_IMODE(mode), 0o644)

    def test_zip_reproducible(self):
        again = build_kit(self.data, self.ckpt, Path(self._tmp.name) / "kit2.zip", "2026.11.1")
        self.assertEqual(self.zip.read_bytes(), again.read_bytes())


if __name__ == "__main__":
    unittest.main()
