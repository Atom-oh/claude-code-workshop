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

Learners fetch the kit on ccb-endpoint without credentials from the public event
assets bucket (the upload above replicates to it), then unzip into `~/claude-lab/mydata/`:

    aws s3 cp --no-sign-request s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip /tmp/mydata-kit.zip

Public https form: `https://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee.s3.us-east-1.amazonaws.com/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip`

Verify that the replicated public object matches the local build:

    aws s3 cp --no-sign-request s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip /tmp/check.zip
    shasum -a 256 /tmp/check.zip tools/mydata/dist/mydata-kit.zip  # must match
There is no signed URL, so no URL check script.
