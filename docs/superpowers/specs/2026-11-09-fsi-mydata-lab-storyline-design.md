# FSI Hands-on Labs: "A Day of a Bank Customer-Asset Analyst" on MyData

- Date: 2026-11-09
- Event: FSI Claude Code Deep Dive Workshop (2026-11-16 to 11-17)
- Source labs: the renumbered lab pages in `20261116/` (see the
  "November Event Chapters" table in `AGENTS.md`). `FSI_202611/02_HandsOnLab`
  is the delivery copy.
- Scope (owner decision): rewrite **all six chapters** on this storyline before
  the 11-16 event. There is no reduced fallback scope.
- Status: approved design, not yet implemented

## 1. Intent

Each current lab builds an unrelated toy project in `~/claude-lab/chN`
(`calc.py`, a `.env`, a one-row `customers.csv`, a Node user service). Learners
struggle to see how the features apply to their own work.

This design ties every lab into one story: **a day in the life of a bank
customer-asset analyst**. All labs use the same **synthetic financial MyData
set**, and each chapter inherits what the previous one built (agents, a skill,
a plugin). The analyst has two jobs:

1. **Plan new products** from customer MyData.
2. **Provide personalized services** to individual customers.

The destination is a **pension product proposal**. Along the way, learners
build a skill and a plugin, protect customer PII with DLP, and apply
organization-level control through Apps Gateway.

## 2. Goals, non-goals, anti-goals

**Goals**
- One synthetic MyData set runs from Preflight through Chapter 6.
- Learners build: subagents (Ch3), a skill and a plugin (Ch4), a DLP hook
  (Ch2), and Apps Gateway policy (Ch6).
- At the end of Ch4, each learner holds a pension product proposal backed by
  evidence metrics.
- Learners who join mid-way or failed an earlier chapter can catch up from
  checkpoints.

**Non-goals**
- The story does not carry equal weight in every chapter. Ch1 and Ch5 stay
  light, and the Ch4 mod exercise stays a general exercise outside the story.
- Do not reproduce the real Korean MyData API specification exactly; a
  similar shape is enough.
- Accurate product returns or tax calculations are out of scope.

**Anti-goals** (failure even if everything technically runs)
- Synthetic data collides with real people or real numbers.
- DLP blocks the analysis itself so Ch3 and Ch4 cannot proceed.
- The story pushes chapters past their scheduled time (the Ch1 slot already
  runs 10 minutes over).
- Core lessons of the existing labs (policy cannot be bypassed, fail-closed
  hooks, the three dispatch patterns, gateway group policy) disappear while
  being converted into story tasks.

## 3. Chapter map (fixed by the parallel renumbering work)

| Ch | Title | Former content | Lab page(s) in `20261116/` |
| --- | --- | --- | --- |
| 1 | Claude Code는 어떻게 동작하는가 | Ch1 | `ClaudeCode_Ch1_HandsOnLab.html` |
| 2 | Bedrock 위에서 안전하게 쓰기 | Ch2 + Ch3 (one 50-min lecture, two lab pages) | `ClaudeCode_Ch2_HandsOnLab.html`, `ClaudeCode_Ch2_Guardrails_HandsOnLab.html` |
| 3 | Subagent로 일 나눠 맡기기 | Ch4 | `ClaudeCode_Ch3_HandsOnLab.html` |
| 4 | Claude Code 확장하기 | Ch5 | `ClaudeCode_Ch4_HandsOnLab.html` |
| 5 | 비용 효율적으로 쓰기 | Ch6 Part 1 | `ClaudeCode_Ch5_HandsOnLab.html` |
| 6 | 조직의 비용 보고 통제하기 | Ch6 Part 2 | `ClaudeCode_Ch6_HandsOnLab.html` |

Learner folder names such as `~/claude-lab/ch4` keep the old numbers, per the
repository instructions.

## 4. Characters

- **Analyst** (owner decision): a bank customer-asset analyst. Protagonist of
  Ch1, Ch3, Ch4, and Ch5.
- **IT security / platform engineer** (designer call, agreed): deploys policy
  and applies controls. Point of view for Ch2 and Ch6. The existing `sudo` and
  managed-settings steps are narrated as this person's work.
- Apps Gateway accounts: keep the existing `alice` and `bob` and give them
  roles. `alice` is on the asset-analysis team (pension kit and higher-tier
  models allowed); `bob` is on another team (restricted). Renaming is left to
  the builder.

## 5. Chapter design

Base rule: keep each chapter's existing TASK skeleton and learning objectives,
and **replace only the practice material with MyData**.

### Preflight: get the data
- Add CHECK 06 "Download MyData" after CHECK 01-05: `aws s3 cp` the kit from
  the ccb-endpoint terminal, extract, and verify a checksum.
- Location: `~/claude-lab/mydata/` (data is read-only; per-chapter work folders
  stay `~/claude-lab/chN`).

### Ch1. How it works (story weight: light)
- In the analyst's first session, open the pseudonymized set, ask "summarize
  what data we have," and watch the gather, act, verify loop.
- In the existing TASK 02 "sessions are local plaintext files" step, `grep` the
  session JSONL to show the customer data that was just read is stored there
  verbatim. This motivates Ch2's retention and DLP policies.
- The replacement for `calc.py` is left to the builder, within the 20-minute
  standard time.

### Ch2. Using Claude Code safely on Bedrock (story weight: central; security engineer's view)
- Change the target of the existing "block secret file reads" task from
  `.env`/secrets to **`~/claude-lab/mydata/raw/`**. Policy blocks reading raw
  customer data, and learners confirm personal settings cannot undo it.
- Continue into the existing Ch3 DLP hook. Extend the regex beyond resident
  registration and card numbers to **bank account and mobile phone numbers**.
  Keep the fail-open trap and the fail-closed fix.
- The analyst works **only on the pseudonymized set (`pseudo/`)**. So that DLP
  never blocks analysis, `pseudo/` must contain zero DLP pattern matches (a
  generator validation item).
- The merged chapter must lose time. Which Ch3 optional tasks (sandbox, Bedrock
  Guardrails, extension control) and which auto mode sub-steps remain is left
  to the builder, aligned with the new lecture. Whether the former Ch2 TASK 06
  (push the same policy through the gateway) stays in Ch2 or moves to Ch6 is
  also left to the builder.

### Ch3. Delegating work to subagents (story weight: central)
- Replace code-reviewer, test-writer, and docs-writer with three analysis
  agents (names are designer suggestions):
  - `spending-analyst`: infers spending patterns and life stage from card and
    account transactions.
  - `portfolio-analyst`: computes asset mix and retirement-readiness gap from
    deposit, securities, insurance, and pension balances.
  - `risk-reviewer`: read-only; reviews the evidence behind conclusions and
    checks for PII exposure. The existing "tool permission isolation" task is
    demonstrated with this agent.
- Keep the three dispatch patterns (automatic, explicit, parallel). The
  parallel pattern runs per-segment analysis concurrently.
- Output: `segments.md`, listing customer segments with personalized service
  and product ideas per segment. It is the input to Ch4.
- The optional headless/CI task may become a batch scenario such as a nightly
  segment report, or stay as is. Left to the builder.

### Ch4. Extending Claude Code (story weight: central; pension proposal completed)
- **Build a skill first** (new; the current lab has no such step). Example:
  a `retirement-gap` skill holding the fixed procedure, output format, and
  columns for computing the retirement-funding gap of a customer or segment.
  It replaces the `pr-review` skill.
- Turn `fsi-team-kit` into the **asset-analysis team kit**, bundling the three
  Ch3 agents, the `retirement-gap` skill, and the Ch2 DLP hook. Keep the local
  marketplace distribution task.
- With the installed kit, use `segments.md` and the skill to complete the
  **pension product proposal** (`pension-product.md`): target segment, product
  structure (for example IRP and pension savings linkage), customer benefits,
  evidence metrics, risks and caveats. No customer-identifying values may
  appear; the DLP hook enforces this.
- The mod exercises (TASK 03-05) stay as general exercises outside the story.
  The task where the organization controls mods may be narrated from the
  security engineer's view.

### Ch5. Using Claude Code cost-efficiently (story weight: light)
- Replace the "noisy test log" with a **large transaction file** (tens of
  thousands of rows). Compare tokens when reading it whole versus through a
  filter hook or summarization/sampling.
- In the CLAUDE.md diet task, the Ch4 skill becomes the example of "move
  occasional procedures into skills."
- Keep the SessionStart `compact` hook that pins the DLP rule; it fits the
  story.

### Ch6. Seeing and controlling organizational cost (story weight: closing; security engineer's view)
- Keep the telemetry, Apps Gateway login, group model policy, and spend limit
  tasks.
- Explain the `alice`/`bob` difference as "who may use the pension kit and
  higher-tier models." If the gateway can control plugin distribution per
  group, include it; otherwise express the difference only with model policy
  and spend limits. This needs verification against gateway capabilities.
- Closing scene: the analyst's proposal is done, and the organization sees and
  controls who used what and how much.

## 6. Synthetic MyData

**Sectors and contents** (the owner specified "synthetic financial MyData";
the breakdown below is a designer call)

| File (example) | Contents |
| --- | --- |
| `customers` | Profile: age, gender, region, occupation group, income band |
| `bank_accounts`, `bank_transactions` | Deposit accounts, deposits and withdrawals |
| `cards`, `card_transactions` | Cards, approvals with merchant category codes |
| `securities` | Securities holdings |
| `insurance` | Insurance contracts |
| `loans` | Loan balances and rates |
| `pensions` | National pension expected benefit, retirement pension (DB/DC/IRP), personal pension savings |

- Size (designer call): about 1,000 customers and tens of thousands of
  transactions in total. Large enough that reading everything at once overflows
  context in Ch5, small enough to download in seconds.
- Deliberately seed distributions useful for pension planning, for example a
  high-income segment in their 40s-50s with little or no IRP, or a
  near-retirement segment concentrated in DB-type retirement pensions. Ch3
  analysis must reach meaningful conclusions.
- Format (designer call): CSV for analysis, plus some JSON shaped like MyData
  API responses. Final format is left to the builder.

**Two copies** (agreed)
- `raw/`: contains name, resident registration number, mobile number, account
  number, and card number. Ch2 policy blocks reading it; it exists only for
  DLP demonstrations.
- `pseudo/`: the same data with those values replaced by CI-style tokens. All
  analysis happens here.

**Safety requirements**
- Every identifier is a format-only fake value. The existing Ch3 "test data
  only" warning applies to the whole data set. Card numbers use test number
  ranges; resident and phone numbers use ranges unlikely to exist (exact
  ranges left to the builder).
- The generator uses a fixed seed and ships with a validator that checks:
  (a) zero DLP matches in `pseudo/`, (b) ample DLP matches in `raw/`,
  (c) row counts and checksums.

## 7. Distribution and continuity

- **Distribution** (owner decision, revised 2026-11-09): the kit lives in the
  Workshop Studio assets bucket of the Apps Gateway workshop. Upload by placing
  `mydata-kit.zip` in that workshop repo's `assets/` and syncing it to
  `s3://ws-assets-us-east-1/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/` with the AWS
  profile `workshop-2`. Learners run `aws s3 cp` on the single object
  (`s3://ws-assets-prod-iad-r-iad-ed304a55c2ca1aee/5b8d0649-9ad2-43a8-8ff5-10ce7bb42e6f/mydata-kit.zip`)
  from ccb-endpoint with `--no-sign-request` against the replicated public event
  assets bucket; the learner download needs no credentials. No signed URL, so nothing expires
  between Day 1 and Day 2.
  - To verify in the Task 13 rehearsal: the public object is reachable from
    ccb-endpoint.
- **Checkpoints** (agreed): each chapter has a checkpoint bundling what must
  exist when the chapter starts: the DLP script (Ch2), agents and
  `segments.md` (Ch3), the kit (Ch4). This generalizes the existing "no Ch4
  agents, use the fallback block" pattern into a checkpoint download.
- Keep the existing rules: check and reset policy state at chapter start,
  restore at chapter end.

## 8. Constraints

- Each chapter follows the user's schedule within +-30 minutes per session
  (budgets are rough; lab guard rule 4 allows baseline + 30). Data download and
  orientation time is absorbed by Preflight and Ch1.
- Same lab environment as today: ccb-endpoint (code-server), Claude Code 2.1.x,
  Bedrock, Apps Gateway, `alice`/`bob` accounts.
- Chapter structure and lecture decks are being changed in parallel. Lab pages
  follow those chapter numbers and titles.

## 9. Designer calls made after review

- **DLP across chapters**: keep the full managed-policy restore at the end of
  Ch2. From Ch4 on, DLP returns as the kit's **plugin hook**, as the former Ch5
  lab already does. Ch4 states that users can disable plugin hooks and points
  back to Ch2: "to enforce it organization-wide, use the managed hook."
  Because DLP never fires on `pseudo/` by itself, Ch4 keeps a step, as the
  former Ch5 does, that deliberately sends a request containing a resident
  registration number and confirms the block. The Ch5 SessionStart `compact`
  hook is project-level and does not conflict.
- **What to cut when time runs over**: per-chapter minutes follow the parallel
  schedule work, with a +-30 minute tolerance per session. When beyond that, cut optional tasks first, then story narration
  (keep the data, revert to the original wording), then required tasks. Ch2
  must keep "policy cannot be bypassed" and DLP fail-closed. Ch4 must keep the
  skill, kit, proposal flow. The mod exercises are the first thing to shrink
  in Ch4.
- **Day 1 to Day 2 continuity**: do not assume the instance survives
  overnight. Every chapter's TASK 00 checks the prior artifacts it needs
  (`mydata/`, agents, `segments.md`, DLP script) and, if missing, restores
  them from a checkpoint. Checkpoints are therefore the default TASK 00 path,
  not an optional extra.

## 10. Left to the builder

- Exact prompt wording, sample output, and checkpoint wording for each TASK
- Which optional tasks remain in the merged Ch2 and where TASK 06 lives
- Final names of agents, skill, and kit
- Data file formats, column details, identifier ranges
- Ch1 practice material and the Ch3 headless scenario
- How changes in `20261116/` flow into the `FSI_202611/02_HandsOnLab` delivery
  copy
