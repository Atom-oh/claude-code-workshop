"""catchup.sh: run it against a fake HOME with stubbed sudo, claude, aws and use_bedrock_direct."""
import json
import os
import shutil
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "20261116" / "assets" / "catchup.sh"
CHECKPOINTS = ROOT / "tools" / "mydata" / "checkpoints"

STUBS = {
    "sudo": '#!/bin/bash\nexec "$@"\n',
    "use_bedrock_direct": '#!/bin/bash\necho use_bedrock_direct >> "$STUB_LOG"\n',
    # plugin state lives in $STUB_STATE/plugins and $STUB_STATE/markets
    "claude": r'''#!/bin/bash
echo "claude $*" >> "$STUB_LOG"
case "$1 $2 $3" in
  "plugin list "*) cat "$STUB_STATE/plugins" 2>/dev/null ;;
  "plugin marketplace list") cat "$STUB_STATE/markets" 2>/dev/null ;;
  "plugin marketplace add") echo fsi-local > "$STUB_STATE/markets" ;;
  "plugin marketplace remove") : > "$STUB_STATE/markets" ;;
  "plugin install "*) echo "asset-team-kit@fsi-local" > "$STUB_STATE/plugins" ;;
  "plugin uninstall "*) : > "$STUB_STATE/plugins" ;;
esac
''',
    "aws": '#!/bin/bash\necho "aws $*" >> "$STUB_LOG"\ncp "$STUB_KIT" "$4"\n',
}


class CatchupTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.home = self.tmp / "home"
        self.bin = self.tmp / "bin"
        self.etc = self.tmp / "etc"
        self.dlp = self.tmp / "dlp"
        self.state = self.tmp / "state"
        for d in (self.home, self.bin, self.etc / "managed-settings.d", self.state):
            d.mkdir(parents=True)
        for name, body in STUBS.items():
            p = self.bin / name
            p.write_text(body)
            p.chmod(0o755)
        self.log = self.tmp / "log"
        self.log.touch()
        self.kit = self.tmp / "kit.zip"
        with zipfile.ZipFile(self.kit, "w") as z:
            z.writestr("pseudo/customers.csv", "id\n")
            for p in CHECKPOINTS.rglob("*"):
                if p.is_file() and p.name != ".keep":
                    z.write(p, "checkpoints/" + p.relative_to(CHECKPOINTS).as_posix())

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def run_catchup(self, *args, check=True):
        env = {
            "HOME": str(self.home),
            "PATH": "%s:%s" % (self.bin, os.environ["PATH"]),
            "CATCHUP_ETC": str(self.etc),
            "CATCHUP_DLP": str(self.dlp),
            "STUB_LOG": str(self.log),
            "STUB_STATE": str(self.state),
            "STUB_KIT": str(self.kit),
            "WS_KIT": "s3://example/mydata-kit.zip",
        }
        r = subprocess.run(["bash", str(SCRIPT), *args], env=env, capture_output=True, text=True)
        if check:
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        return r

    @property
    def lab(self):
        return self.home / "claude-lab"

    def test_bad_or_missing_argument_exits_2(self):
        self.assertEqual(self.run_catchup(check=False).returncode, 2)
        r = self.run_catchup("ch9", check=False)
        self.assertEqual(r.returncode, 2)
        self.assertIn("알 수 없는 장", r.stderr)

    def test_fetches_kit_when_missing_and_clears_policy(self):
        (self.etc / "managed-settings.json").write_text('{"hooks": {"x": 1}}')
        (self.etc / "managed-settings.d" / "10-security.json").write_text("{}")
        r = self.run_catchup("ch3")
        self.assertTrue((self.lab / "mydata" / "pseudo" / "customers.csv").is_file())
        self.assertIn("aws s3 cp s3://example/mydata-kit.zip", self.log.read_text())
        self.assertEqual(json.loads((self.etc / "managed-settings.json").read_text()), {})
        self.assertEqual(list((self.etc / "managed-settings.d").iterdir()), [])
        self.assertIn("use_bedrock_direct", self.log.read_text())
        self.assertIn("Ch3 랩의 TASK 00", r.stdout)

    def test_skips_download_when_kit_present(self):
        self.run_catchup("ch6")
        self.log.write_text("")
        self.run_catchup("ch6")
        self.assertNotIn("aws s3 cp", self.log.read_text())

    def test_moves_chapter_folder_aside_without_deleting(self):
        self.run_catchup("ch6")
        (self.lab / "ch3").mkdir()
        (self.lab / "ch3" / "note.txt").write_text("mine")
        (self.lab / "ch4").mkdir()
        r = self.run_catchup("3")
        self.assertFalse((self.lab / "ch3").exists())
        kept = list((self.lab / ".catchup-backup").glob("ch3-*/note.txt"))
        self.assertEqual(len(kept), 1)
        self.assertEqual(kept[0].read_text(), "mine")
        self.assertTrue((self.lab / "ch4").is_dir(), "other chapters' folders stay")
        self.assertIn("옮겼습니다", r.stdout)

    def test_ch2_lab_names_and_folders(self):
        self.run_catchup("ch6")
        (self.lab / "ch2").mkdir()
        r = self.run_catchup("ch2-lab2")
        self.assertFalse((self.lab / "ch2").exists())
        self.assertIn("Ch2 Lab 2 랩", r.stdout)
        self.assertIn("Ch2 Lab 1 랩", self.run_catchup("ch2-lab1").stdout)
        (self.lab / "ch1-loop").mkdir()
        self.run_catchup("1")
        self.assertFalse((self.lab / "ch1-loop").exists())

    def test_drops_lab1_raw_rules_from_user_settings_only(self):
        s = self.home / ".claude" / "settings.json"
        s.parent.mkdir()
        s.write_text(json.dumps({
            "env": {"A": "1"},
            "permissions": {"allow": ["Read(~/claude-lab/mydata/raw/**)", "Read(~/claude-lab/ch2/raw/**)", "Bash(ls)"]},
        }))
        self.run_catchup("ch3")
        got = json.loads(s.read_text())
        self.assertEqual(got["permissions"], {"allow": ["Bash(ls)"]})
        self.assertEqual(got["env"], {"A": "1"})
        self.assertTrue((s.parent / "settings.json.before-catchup").is_file())

    def test_removes_empty_permissions_and_leaves_clean_settings_untouched(self):
        s = self.home / ".claude" / "settings.json"
        s.parent.mkdir()
        s.write_text(json.dumps({"permissions": {"allow": ["Read(~/claude-lab/mydata/raw/**)"]}}))
        self.run_catchup("ch3")
        self.assertNotIn("permissions", json.loads(s.read_text()))
        clean = {"permissions": {"additionalDirectories": ["~/claude-lab/mydata"]}}
        s.write_text(json.dumps(clean))
        (s.parent / "settings.json.before-catchup").unlink()
        self.run_catchup("ch3")
        self.assertEqual(json.loads(s.read_text()), clean)
        self.assertFalse((s.parent / "settings.json.before-catchup").exists())

    def test_ch4_fills_ch3_material_and_dlp_and_removes_plugin(self):
        (self.state / "plugins").write_text("asset-team-kit@fsi-local\n")
        (self.state / "markets").write_text("fsi-local\n")
        self.run_catchup("ch6")
        agents = self.lab / "ch3" / ".claude" / "agents"
        agents.mkdir(parents=True)
        (agents / "risk-reviewer.md").write_text("my own")
        self.run_catchup("ch4")
        self.assertEqual((agents / "risk-reviewer.md").read_text(), "my own", "keeps the learner's copy")
        for a in ("spending-analyst", "portfolio-analyst"):
            self.assertTrue((agents / (a + ".md")).is_file())
        self.assertTrue((self.lab / "ch3" / "segments.md").is_file())
        dlp = self.dlp / "dlp-guard.sh"
        self.assertEqual(dlp.read_bytes(), (CHECKPOINTS / "ch2" / "dlp-guard.sh").read_bytes())
        self.assertTrue(os.access(dlp, os.X_OK))
        self.assertEqual((self.state / "plugins").read_text(), "")
        self.assertEqual((self.state / "markets").read_text(), "")

    def test_ch5_installs_plugin_from_ch4_marketplace(self):
        self.run_catchup("ch5")
        m = self.lab / "ch4" / "marketplace"
        self.assertTrue((m / "plugins" / "asset-team-kit" / ".claude-plugin" / "plugin.json").is_file())
        cat = json.loads((m / ".claude-plugin" / "marketplace.json").read_text())
        self.assertEqual(cat["name"], "fsi-local")
        log = self.log.read_text()
        self.assertIn("claude plugin marketplace add %s" % m, log)
        self.assertIn("claude plugin install asset-team-kit@fsi-local", log)
        self.log.write_text("")
        self.run_catchup("ch5")
        self.assertNotIn("plugin install", self.log.read_text(), "already installed: no reinstall")
        self.assertNotIn("uninstall", self.log.read_text())

    def test_ch6_leaves_plugin_alone(self):
        (self.state / "plugins").write_text("asset-team-kit@fsi-local\n")
        self.run_catchup("ch6")
        self.assertEqual((self.state / "plugins").read_text(), "asset-team-kit@fsi-local\n")


if __name__ == "__main__":
    unittest.main()
