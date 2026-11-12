#!/usr/bin/env bash
# Rebuild the November reactive decks from their Remarp sources.
#
#   20261116/reactive/build.sh            validate, then build all six decks
#   20261116/reactive/build.sh validate   validate only
#
# Needs the reactive-presentation compiler from the aws-content-plugin
# (marketplace Atom-oh/oh-my-cloud-skills); see README.md in this folder.
# Set REMARP_COMPILER to a remarp_to_slides.py path to use a specific copy.
# After the build it restores the hand-maintained toc.html and strips trailing
# whitespace from the generated HTML, as AGENTS.md requires.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"

compiler="${REMARP_COMPILER:-}"
if [ -z "$compiler" ]; then
  # Newest installed plugin version wins.
  compiler="$(ls -d "$HOME"/.claude/plugins/cache/oh-my-cloud-skills/aws-content-plugin/*/skills/reactive-presentation/scripts/remarp_to_slides.py 2>/dev/null | sort -V | tail -n 1 || true)"
fi
if [ -z "$compiler" ] || [ ! -f "$compiler" ]; then
  echo "reactive-presentation compiler not found." >&2
  echo "Install it in Claude Code:" >&2
  echo "  /plugin marketplace add Atom-oh/oh-my-cloud-skills" >&2
  echo "  /plugin install aws-content-plugin@oh-my-cloud-skills" >&2
  echo "or set REMARP_COMPILER=/path/to/remarp_to_slides.py" >&2
  exit 1
fi
echo "compiler: $compiler"

python3 "$compiler" validate .
[ "${1:-}" = "validate" ] && exit 0

toc_backup="$(mktemp)"
trap 'rm -f "$toc_backup"' EXIT
cp toc.html "$toc_backup"
python3 "$compiler" build .
cp "$toc_backup" toc.html

for f in ./*.html; do
  sed -i.bak -e 's/[[:space:]]*$//' "$f" && rm -f "$f.bak"
done
echo "Done. Review: git diff --stat -- 20261116/reactive"
