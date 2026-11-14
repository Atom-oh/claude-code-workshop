# Line-art library (vendored)

Browser ES modules converted from github.com/JDhruv14/line-art-animation
at commit `c43d698913cf0ad44f984c7ae14c5348010594d3` (MIT, see `LICENSE`): `lib/ink.ts`, `lib/gait.ts`,
`lib/motion.ts` and `lib/daynight.ts`.

Conversion: Node's built-in `module.stripTypeScriptTypes` (strip mode), with
`./x.ts` imports rewritten to `./x.js`. No other changes. The four files
were read in full before vendoring; they only build SVG and do arithmetic
(no network, storage or eval).

To update, fetch the same four files at a new commit, convert them the same
way, read the diff, and update the commit above.
