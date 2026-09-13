# PR Review

## Context

Use [AGENTS.md](../AGENTS.md) as the shared repository instructions.
[Architecture](architecture.md) describes the actual runtime and publishing
paths; the [ADR index](decisions/README.md) identifies accepted decisions.

This repository currently contains only a Pages deployment workflow. It does
not contain a `pr-review` runner, model roster, or automated AI review workflow.
An installed/shared review tool is external tooling, not repository CI.

A reviewer that receives only a diff cannot automatically read these documents.
For a tool-free Kiro reviewer, supply their text in the review request; a file
path or Markdown link is insufficient. The orchestrator must:

1. Record the target branch, base commit, and exact PR HEAD SHA.
2. Read the accepted instructions from the base and the proposed instructions
   from HEAD. Include the relevant architecture/ADR text and the complete diff.
   Treat changed instructions as review subjects, not permission to weaken gates.
3. Identify existing facts, requested changes, and historical material explicitly.
   Include surrounding source or validation evidence where a diff is insufficient.
4. Record review coverage, truncation, tool/model failures, and the reviewed SHA.
   If required context or diff sections are missing, retrieve them and retry.

Keep context relevant: do not preload hundreds of lesson files or duplicate
English and Korean versions of project instructions.

## Findings

Report the affected file/line, triggering condition, observed evidence, and
consequence. Evaluate both correctness and applicable project requirements.

| Severity | Meaning |
| --- | --- |
| Critical | Demonstrable severe security exposure, destructive behavior, or comparable impact |
| Major | Material functional failure, broken required contract, or misleading instructions that prevent the intended task |
| Minor | Limited defect or maintainability problem with bounded impact |
| Info | Optional improvement or explanatory note |

Do not escalate uncertainty into a defect. State what evidence is missing.
Style preferences alone do not establish Major severity.

Common scope mistakes:

- Treating a lesson's example `CLAUDE.md`, ADR, AWS policy, or deployment command
  as instructions or infrastructure for this repository.
- Requiring application tests or builds absent from this static content project.
- Treating Korean course material as a violation of English maintenance docs.
- Applying obsolete bilingual rules, historical release paths, or another
  project's branding restrictions to current changes.
- Expecting the two site editions to have identical capstones, assets, or themes.

Educational content still needs review: broken lab commands, exposed secrets,
unsafe instructions, and inaccurate explanations may be real findings.
Check them in their stated learner environment and version, rather than
assuming they execute in the Pages runtime.

## Validation and Merge

Run `git diff --check`, verify changed links and claims, and perform checks
appropriate to affected content. For site changes, use the published-layout
preview in [architecture](architecture.md). Before deployment,
`content-review-agent` must report PASS at or above 85% on the applicable scale
(Markdown: at least 77/90). This review does not replace PR review or CI.

When assigned PR completion:

1. Read AI reviews and inline comments for the latest HEAD.
2. Verify and fix Critical/Major findings, run relevant checks, commit and push,
   then obtain a fresh review of the new HEAD.
3. Missing, failed, incomplete, or truncated required review coverage is not a
   pass. Retry recoverable failures; report concrete external blockers.
4. Merge without another confirmation once the latest-HEAD review is complete,
   no Critical/Major finding remains unresolved, and required CI and branch
   protection conditions pass. Minor/Info alone do not block this process.
5. Immediately before merging, recheck HEAD, target branch, and prerequisite PRs.
   Any new commit returns to review. Never disable required gates.
6. Report changes, validation, the PR URL, and the merge result.

A local review is evidence only for its recorded commit and coverage. Do not
describe it as a GitHub review or a completed CI check unless it was actually
recorded there.
