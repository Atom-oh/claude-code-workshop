import tempfile
import unittest
from pathlib import Path

from tools.capstone.check_capstone import (
    ARCHIVE_PAGES,
    NEW_PAGES,
    R1_PAGES,
    R2_PAGES,
    check,
)

OVERVIEW = "ClaudeCode_Capstone_Overview.html"
PACKAGE = "ClaudeCode_Capstone_R2_Package_HandsOnLab.html"


R2_3_BODY = ('<section id="cleanup"><pre>agentcore remove all --yes</pre></section>'
             '<pre>{ "permissions": { "ask": [ "Bash(agentcore deploy *)" ] } }</pre>')

PUBLIC_KIT = "${WS_KIT:-s3://public-bucket/abc/mydata-kit.zip}"
CH3 = "ClaudeCode_Ch3_HandsOnLab.html"
CH3_PAGE = (f"<html><body><pre>KIT={PUBLIC_KIT}\n"
            "aws s3 cp &quot;$KIT&quot; /tmp/mydata-kit.zip</pre></body></html>")


def restore_pre(kit=PUBLIC_KIT, flag=""):
    return (f"<pre>KIT={kit}\n[ -d ~/claude-lab/mydata/pseudo ] || "
            f'(aws s3 cp {flag}"$KIT" /tmp/mydata-kit.zip)</pre>')


RESTORE_PRE = restore_pre()


def page(round_=None, minutes=(), body="", step00=None):
    parts = ["<html><body>"]
    if round_:
        parts.append(f'<p class="round" data-round="{round_}">{round_}</p>')
    for i, m in enumerate(minutes):
        inner = step00 if (i == 0 and step00 is not None) else "step"
        sid = "task-00" if (i == 0 and step00 is not None) else f"t{i}"
        parts.append(f'<section class="task" id="{sid}" data-min="{m}">{inner}</section>')
    parts.append(body)
    parts.append("</body></html>")
    return "".join(parts)


def make_site(tmp, r1a_minutes=(50, 45), r2_minutes=None, extra=None, drop=(),
              overview_checks=7, with_submit=True, with_note=True,
              archive_note=True, portal_archive=True, portal_new=True):
    """Build a minimal site that passes every rule; overrides break one spot."""
    root = Path(tmp) / "site"
    root.mkdir(parents=True)
    r2_minutes = r2_minutes or {}
    files = {}
    checks = "".join(f'<li data-check="{i}">c</li>' for i in range(1, overview_checks + 1))
    submit = '<section id="submit">제출</section>' if with_submit else ""
    files[OVERVIEW] = page(body=f"<ul>{checks}</ul>{submit}")
    for name in R1_PAGES:
        short = name.split("_")[2]
        mins = r1a_minutes if short == "R1A" else (40, 40)
        files[name] = page("R1", mins, step00=RESTORE_PRE if short == "R1A" else None)
    for name in R2_PAGES:
        mins = r2_minutes.get(name, (30, 30))
        body = '<p data-note="managed-enforce">managed</p>' if (name == PACKAGE and with_note) else ""
        if name == R2_PAGES[3]:
            body += R2_3_BODY
        files[name] = page("R2", mins, body)
    new_links = "".join(f'<a href="{n}">x</a>' for n in NEW_PAGES) if portal_new else ""
    arch_links = "".join(f'<a href="{n}">x</a>' for n in ARCHIVE_PAGES) if portal_archive else ""
    files["index.html"] = (
        f'<html><body><section id="capstones">{new_links}'
        f'<div id="capstone-archive">{arch_links}</div></section></body></html>'
    )
    files[CH3] = CH3_PAGE
    files["ClaudeCode_Capstone_Setup.html"] = page(body=f'<a href="{OVERVIEW}">o</a>')
    note = f'<div class="archive-note"><a href="{OVERVIEW}">new</a></div>' if archive_note else ""
    for name in ARCHIVE_PAGES:
        files[name] = page(body=note)
    for name in drop:
        files.pop(name, None)
    files.update(extra or {})
    for rel, text in files.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
    return root


def rule(msgs, name):
    return [m for m in msgs if m.startswith(name)]


class CheckCapstoneTest(unittest.TestCase):
    def setUp(self):
        self._td = tempfile.TemporaryDirectory()
        self.tmp = self._td.name
        self.addCleanup(self._td.cleanup)

    def test_clean_site_passes(self):
        self.assertEqual(check(make_site(self.tmp)), [])

    def test_r1a_restore_requires_kit_download(self):
        for i, pre in enumerate(("<pre>ls ~/claude-lab/mydata/pseudo</pre>",
                                 "<pre>aws s3 cp s3://x/mydata-kit.zip /tmp/k.zip</pre>",
                                 "<p>kit</p>")):
            root = make_site(f"{self.tmp}/{i}",
                             extra={R1_PAGES[0]: page("R1", (50, 45), step00=pre)})
            self.assertTrue(rule(check(root), "r1a_restore"), pre)
        root = make_site(f"{self.tmp}/none", extra={R1_PAGES[0]: page("R1", (50, 45))})
        self.assertTrue(rule(check(root), "r1a_restore"))
        self.assertFalse(rule(check(make_site(f"{self.tmp}/ok")), "r1a_restore"))

    def test_r1a_restore_rejects_private_bucket_uri(self):
        pre = restore_pre(kit="s3://ws-assets-us-east-1/abc/mydata-kit.zip")
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), step00=pre)})
        self.assertTrue(any("KIT=" in m for m in rule(check(root), "r1a_restore")))
        pre = restore_pre(kit="s3://public-bucket/abc/mydata-kit.zip")  # no WS_KIT fallback
        root = make_site(f"{self.tmp}/plain", extra={R1_PAGES[0]: page("R1", (50, 45), step00=pre)})
        self.assertTrue(any("KIT=" in m for m in rule(check(root), "r1a_restore")))

    def test_r1a_restore_rejects_unsigned_download(self):
        pre = restore_pre(flag="--no-sign-request ")
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), step00=pre)})
        self.assertTrue(any("--no-sign-request" in m for m in rule(check(root), "r1a_restore")))

    def test_r1a_restore_fails_without_ch3_reference(self):
        root = make_site(self.tmp, drop=[CH3])
        self.assertTrue(any(CH3 in m for m in rule(check(root), "r1a_restore")))

    def test_r2_3_requires_cleanup_and_ask_rule(self):
        name = R2_PAGES[3]
        no_cleanup = '<pre>{ "permissions": { "ask": [ "Bash(agentcore deploy *)" ] } }</pre>'
        no_ask = '<section id="cleanup"><pre>agentcore remove all --yes</pre></section>'
        ask_in_prose = no_ask + '<p>"ask" 규칙 Bash(agentcore deploy *)</p>'
        for i, body in enumerate((no_cleanup, no_ask, ask_in_prose, "")):
            root = make_site(f"{self.tmp}/{i}", extra={name: page("R2", (30, 30), body)})
            self.assertTrue(rule(check(root), "r2_3_cleanup"), body)
        self.assertFalse(rule(check(make_site(f"{self.tmp}/ok")), "r2_3_cleanup"))

    def test_r2_3_cleanup_needs_remove_or_delete_command(self):
        ask = '<pre>{ "permissions": { "ask": [ "Bash(agentcore deploy *)" ] } }</pre>'
        bodies = ('<section id="cleanup"><p>agentcore remove all</p></section>' + ask,
                  '<section id="cleanup"><pre>agentcore status</pre></section>' + ask,
                  '<section id="cleanup"></section><pre>agentcore remove all</pre>' + ask)
        for i, body in enumerate(bodies):
            root = make_site(f"{self.tmp}/{i}", extra={R2_PAGES[3]: page("R2", (30, 30), body)})
            self.assertTrue(rule(check(root), "r2_3_cleanup"), body)
        ok = '<section id="cleanup"><pre>aws cloudformation delete-stack</pre></section>' + ask
        root = make_site(f"{self.tmp}/ok", extra={R2_PAGES[3]: page("R2", (30, 30), ok)})
        self.assertFalse(rule(check(root), "r2_3_cleanup"))

    def test_exists_fails_when_page_missing(self):
        root = make_site(self.tmp, drop=[R1_PAGES[1]])
        self.assertTrue(any(m.startswith("exists") and R1_PAGES[1] in m for m in check(root)))

    def test_links_fails_on_missing_file_and_anchor(self):
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), '<a href="nope.html">x</a>')})
        self.assertTrue(rule(check(root), "links"))
        root2 = Path(self.tmp) / "site"
        (root2 / R1_PAGES[0]).write_text(
            page("R1", (50, 45), f'<a href="{OVERVIEW}#nothing">x</a>'), encoding="utf-8")
        self.assertTrue(rule(check(root2), "links"))

    def test_links_passes_for_external_inpage_and_valid_anchor(self):
        body = (f'<a href="https://example.com/x">e</a><a href="#t0">i</a>'
                f'<a href="{OVERVIEW}#submit">o</a><a href="mailto:a@b.c">m</a>')
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), body)})
        self.assertFalse(rule(check(root), "links"))

    def test_links_fails_on_missing_inpage_anchor(self):
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), '<a href="#zzz">x</a>')})
        self.assertTrue(rule(check(root), "links"))

    def test_overview_checklist_fails_with_six_items_or_no_submit(self):
        self.assertTrue(rule(check(make_site(self.tmp, overview_checks=6)), "overview_checklist"))
        with tempfile.TemporaryDirectory() as t2:
            self.assertTrue(rule(check(make_site(t2, with_submit=False)), "overview_checklist"))

    def test_time_budget_fails_when_r1_plus_setup_over_110(self):
        # 50 + 46 = 96 page minutes, + 15 SETUP = 111 > 110
        msgs = check(make_site(self.tmp, r1a_minutes=[50, 46]))
        self.assertTrue(any(m.startswith("time_budget") and "R1A" in m and "SETUP" in m
                            for m in msgs))

    def test_time_budget_r1_95_plus_setup_passes(self):
        self.assertFalse(rule(check(make_site(self.tmp, r1a_minutes=[50, 45])), "time_budget"))

    def test_time_budget_r2_uses_package_plus_two_largest(self):
        # package 60, missions 70/60/20 -> 60+70+60 = 190 > 180
        mins = {PACKAGE: (60,), R2_PAGES[1]: (70,), R2_PAGES[2]: (60,), R2_PAGES[3]: (20,)}
        msgs = check(make_site(self.tmp, r2_minutes=mins))
        self.assertTrue(any(m.startswith("time_budget") and "R2" in m for m in msgs))

    def test_time_budget_r2_third_mission_ignored(self):
        # 60 + 60 + 60 = 180 passes even though a third 60 exists
        mins = {PACKAGE: (60,), R2_PAGES[1]: (60,), R2_PAGES[2]: (60,), R2_PAGES[3]: (60,)}
        self.assertFalse(rule(check(make_site(self.tmp, r2_minutes=mins)), "time_budget"))

    def test_time_budget_flags_missing_or_wrong_round(self):
        root = make_site(self.tmp, extra={
            R1_PAGES[0]: page(None, (50, 45)),
            R2_PAGES[1]: page("R1", (30, 30))})
        msgs = rule(check(root), "time_budget")
        self.assertTrue(any(R1_PAGES[0] in m and "data-round" in m for m in msgs))
        self.assertTrue(any(R2_PAGES[1] in m and "data-round" in m for m in msgs))

    def test_time_budget_still_budgets_page_without_round(self):
        root = make_site(self.tmp, extra={R1_PAGES[0]: page(None, (60, 55))})
        self.assertTrue(any("R1A is 115" in m for m in check(root)))  # page minutes

    def test_time_budget_flags_bad_data_min(self):
        body = ('<section class="task" id="bad1">x</section>'
                '<section class="task" id="bad2" data-min="abc">x</section>')
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50,), body)})
        msgs = rule(check(root), "time_budget")
        self.assertTrue(any("task bad1" in m and "data-min" in m for m in msgs))
        self.assertTrue(any("task bad2" in m for m in msgs))

    def test_archive_fails_when_note_lacks_overview_link(self):
        root = make_site(self.tmp)
        (root / ARCHIVE_PAGES[0]).write_text(
            page(body='<div class="archive-note">no link</div>'), encoding="utf-8")
        self.assertTrue(any(ARCHIVE_PAGES[0] in m for m in rule(check(root), "archive")))

    def test_archive_fails_when_page_missing(self):
        root = make_site(self.tmp, drop=[ARCHIVE_PAGES[3]])
        self.assertTrue(any(ARCHIVE_PAGES[3] in m for m in rule(check(root), "archive")))

    def test_archive_fails_without_note(self):
        self.assertTrue(rule(check(make_site(self.tmp, archive_note=False)), "archive"))

    def test_portal_fails_when_links_missing(self):
        self.assertTrue(rule(check(make_site(self.tmp, portal_new=False)), "portal"))
        with tempfile.TemporaryDirectory() as t2:
            self.assertTrue(rule(check(make_site(t2, portal_archive=False)), "portal"))

    def test_guardrail_note_fails_without_marker(self):
        self.assertTrue(rule(check(make_site(self.tmp, with_note=False)), "guardrail_note"))

    def test_secret_scan_flags_hex_key_but_not_placeholder(self):
        root = make_site(self.tmp, extra={"capstone/x/README.md": "SEOUL_API_KEY=YOUR_KEY\n"})
        self.assertFalse(rule(check(root), "secret_scan"))
        (root / "capstone/x/README.md").write_text("SEOUL_API_KEY=4a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d\n")
        self.assertTrue(rule(check(root), "secret_scan"))

    def test_secret_scan_flags_aws_key_in_page(self):
        root = make_site(self.tmp, extra={R1_PAGES[0]: page("R1", (50, 45), "<p>AKIAABCDEFGHIJKLMNOP</p>")})
        self.assertTrue(rule(check(root), "secret_scan"))

    def test_secret_scan_allows_angle_and_sample(self):
        root = make_site(self.tmp, extra={"capstone/y.txt": "api_key: <your key>\nkey=sample\n"})
        self.assertFalse(rule(check(root), "secret_scan"))


if __name__ == "__main__":
    unittest.main()
