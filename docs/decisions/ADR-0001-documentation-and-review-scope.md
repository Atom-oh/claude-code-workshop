# ADR-0001: Repository Documentation and Review Scope

- Status: Accepted
- Date: 2026-09-13
- Scope: Project documentation and PR review

## Context

The original root instructions described only PDF/snippet distribution and
required bilingual project documents. The repository also contains two HTML
sites and a Pages workflow. Those stale rules can produce contradictory review
expectations. The maintainer requested concise English documentation aligned
with the actual project.

## Decision

Use [AGENTS.md](../../AGENTS.md) as the shared instruction source and make
`CLAUDE.md` import it. Write maintenance documents in English; preserve Korean
teaching content. Keep current architecture separate from release history and
educational examples.

Document the two sites and the existing Pages copy/deploy behavior as the
current architecture. Do not invent backend services, application build steps,
or PR automation. External reviewers must receive relevant project context
explicitly when they cannot read repository files.

Use [the review procedure](../review.md) to ground findings in evidence and retain
the latest-HEAD review, required-check, and Critical/Major merge gates.

## Consequences

Agents share one concise policy instead of divergent copies. Architecture and
review details are read on demand. This decision replaces the old root
bilingual-document requirement and PDF-only description; historical release
records remain historical. Documentation changes alone do not install or prove
the operation of an external review runner.
