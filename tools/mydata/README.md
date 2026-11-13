# MyData kit tooling

Builds the synthetic MyData kit (`mydata-kit.zip`) used by the 20261116 labs.
Python 3.9+ stdlib only. Nothing under `tools/` is published; `dist/` is gitignored.

## Generate and validate

    python3 tools/mydata/generate.py --out tools/mydata/dist/data --seed <seed>
    python3 tools/mydata/validate.py tools/mydata/dist/data

`raw/` holds format-only fake identifiers (DLP demo); `pseudo/` must have zero DLP matches.

## Build

    python3 tools/mydata/build.py --version 2026.11.2

`build.py` regenerates and validates the data, then packs `raw/`, `pseudo/`, `checkpoints/`
(ch2, ch3, ch4), `VERSION`, and `SHA256SUMS` into `tools/mydata/dist/mydata-kit.zip`.

## Check lab pages

    python3 tools/mydata/check_labs.py 20261116 tools/mydata/dist/mydata-kit.zip

Expect `OK` for all pages.

## Upload (single object)

    aws s3 ls --profile workshop-2 s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/
    aws s3 cp --profile workshop-2 tools/mydata/dist/mydata-kit.zip \
      s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip

The prefix holds other live workshop assets: never use `sync`, `rm`, `--delete`, or `--recursive`.
Optionally copy the zip to `assets/` of the apps-gateway workshop repo (zips are gitignored there).

## Verify

    aws s3api head-object --profile workshop-2 --bucket ws-assets-us-east-1 \
      --key 5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip   # ContentLength == local size
    aws s3 cp --profile workshop-2 s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip /tmp/dl.zip
    shasum -a 256 /tmp/dl.zip tools/mydata/dist/mydata-kit.zip  # must match
    unzip -q /tmp/dl.zip -d /tmp/kit && (cd /tmp/kit && shasum -a 256 -c --quiet SHA256SUMS && ls checkpoints)

## Learner download

Learners fetch the kit on ccb-endpoint with the instance role, then unzip into
`~/claude-lab/mydata/`. The lab PC's `.bashrc` exports `WS_KIT`, the kit in the event's own
asset bucket (`s3://${AssetsBucketName}/${AssetsBucketPrefix}mydata-kit.zip`). Workshop Studio
copies the authoring bucket into it when the event is created, so a kit upload reaches the next
new event. The public `ws-assets-prod-…` copy below only refreshes when the workshop is
published (2026-11-11: it still served 2026.11.1), so it is only the fallback:

    KIT=${WS_KIT:-s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip}
    aws s3 cp "$KIT" /tmp/mydata-kit.zip

`check_labs.py` rule 7 and `check_capstone.py` r1a_restore enforce this form.

Public https form: `https://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee.s3.us-east-1.amazonaws.com/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip`

After a publish, verify that the public copy matches the local build:

    aws s3 cp --no-sign-request s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip /tmp/check.zip
    shasum -a 256 /tmp/check.zip tools/mydata/dist/mydata-kit.zip  # must match
There is no signed URL, so no URL check script.

## catchup

`20261116/assets/catchup.sh` puts the lab PC in the state a chapter's TASK 00 expects, so a
learner whose earlier lab failed can start the next one: `catchup ch4` (also `ch2-lab2`,
`ch1`-`ch6`, or a bare number). It fetches the kit if missing, clears managed policy, drops
Ch2 Lab 1's raw-read rules from `~/.claude/settings.json`, runs `use_bedrock_direct`, moves
the chapter's own folder to `~/claude-lab/.catchup-backup/`, removes the Ch4 plugin before
Ch2-Ch4, and fills earlier-chapter material from `checkpoints/` (Ch4: Ch3 agents,
`segments.md`, DLP hook; Ch5: asset-team-kit). Labs Ch2-Ch6 show it at the top of TASK 00.

The Workshop Studio stack installs it as `~/.local/bin/catchup`. Pages publishes the same
file, so a PC without it runs
`curl -fsSL https://www.atomai.click/claude-code-workshop/20261116/assets/catchup.sh | bash -s ch4`.
`tests/test_catchup.py` runs it against a fake HOME with stubbed `sudo`, `claude`, `aws` and
`use_bedrock_direct` (`CATCHUP_ETC` and `CATCHUP_DLP` redirect `/etc/claude-code` and `/opt/dlp`).
