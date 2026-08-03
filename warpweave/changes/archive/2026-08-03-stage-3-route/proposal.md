## Why

Stage 1 sorts the task, Stage 2 grades its verifiability. Stage 3 closes the triage loop: combine `(task type, verifiability level)` into a **run plan** — which orchestration depth, which model tier, which checks. This is mechanism 3 (docs/mechanics.md §3): "cheapest sufficient model + orchestration depth", gated by the verifiability level, so later stages (execute, verify, ask) know exactly how deep and how cheap to go.

## What Changes

- New `route` subcommand: `veridia route --type <type> --level <level>` prints a deterministic run plan.
- Inputs: task type (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open` from Stage 1) and verifiability level (`0`–`3` from Stage 2).
- Output plan fields: orchestration depth, model tier, trust stance, planned steps (which orchestration steps run) and checks (which verifier oracles gate the result).
- Mapping table is a pure, deterministic function of `(type, level)`, derived from docs/mechanics.md §3:
  - level 3 → full TDD orchestration, cheapest/confident routing, trust the verifier;
  - level 2 → TDD where possible + ask humans, mid tier, verify structure / judgment → human;
  - level 1 → minimal orchestration + clarifying questions, any tier, trust human judgment;
  - level 0 → just do it + ask expectation, cheapest tier, human judgment is the floor.
- Task type modulates the plan (e.g. `explore`/`open` skip the TDD execute loop; `doc`/`feature` adjust steps), not the level gating.
- Deterministic, stdlib-only, no model calls — the routing *policy* is static data, not an AI decision.
- **BREAKING**: none — additive subcommand.

## Capabilities

### New Capabilities
- `route`: the veridia `route` subcommand — turns a (task type, verifiability level) pair into a deterministic run plan (orchestration depth, model tier, trust, steps, checks).

### Modified Capabilities

<!-- None — `cli`, `classify`, `assess` behavior unchanged; `route` is additive. -->

## Impact

- New source: `src/route/` (mapping table + plan assembly), wired into `src/cli/index.ts`.
- New tests: `test/route.test.ts` (table-driven corpus).
- Existing CLI arg dispatch gains a `route` branch; existing behavior untouched.
- No runtime dependencies (pure data + stdlib).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — route is mechanism 3 and the bridge from triage to execution. Scope held to static policy output: no config file yet (that is integration/polish, Stage 7), no model routing calls. |
| Existing code reuse? | Reuse Stage 1 `TaskType` union and Stage 0 CLI dispatch; module layout mirrors `src/classify/`. |
| Stdlib? | Yes — pure function + static table, no I/O beyond argv parsing. |
| Native platform? | N/A — no filesystem/network. |
| New dependency? | No. A rules engine (e.g. `zod`/`ajv` for the table) would be over-engineering (rung 7: a small static table + lookup suffices). |

## Complexity

Complexity: **normal** — new component (`src/route/`), new public subcommand, table-driven tests.
