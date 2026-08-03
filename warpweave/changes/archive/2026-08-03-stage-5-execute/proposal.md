## Why

Stages 1–4 plan and ask; Stage 5 closes the loop: **run the planned checks, weigh them, gate on the verdict**. This is mechanism 4 (docs/mechanics.md §4) — the weighted verifier. It is the quality backstop: without it, `assess→route→ask` is just decision-making with no feedback. The weight (how much a check *captures meaning*, not whether it exists) is the defense against verifiability theater (docs/verifiability.md §44–101). This stage builds the deterministic verify core; the mutation/history weighting signals are deferred to Stage 6 (measure/learn) per the docs.

## What Changes

- New `verify` subcommand: `veridia verify --target <path> --type <type> --level <level>` runs the target's mechanical oracles, weighs the results, and prints a verdict with a gate.
- Oracle discovery reuses the Stage 2 probe (`test-runner`/`type-check`/`lint`/`ci` → which commands to run). Command resolution: read `package.json` scripts (`test`/`typecheck`/`lint`), falling back to runnable defaults (`tsc --noEmit`, etc.).
- Execution: spawn each oracle's command as a subprocess (stdlib `child_process`), collect pass/fail + duration.
- **Weighting under the theater guard**: each oracle's effective weight starts from its kind (test runner > type-check > lint), then is downgraded by a mechanical weakness probe with no judgment required (e.g. no tests or empty/assert-less test files ⇒ the test oracle is treated as weak/theater). Weight is a static, deterministic function of the detected command output/state — never an opinion.
- **Verdict gate** derived from `(level, weighted checks)`:
  - level 3: PASS only if all strong checks pass; any strong failure → FAIL;
  - level 2: PASS if all runnable checks pass (structure verified), else FAIL; judgment flagged for a human;
  - level 0/1: no mechanical gate — verdict `HUMAN` (run only, report, do not pass/fail).
- Deterministic, stdlib-only. Subprocess execution is the only non-pure surface, kept injectable via a `run` seam for tests (no real commands in unit tests).
- **BREAKING**: none — additive subcommand.

## Capabilities

### New Capabilities
- `verify`: the veridia `verify` subcommand — discovers oracle commands, runs them, computes a weighted verdict + gate (PASS / FAIL / HUMAN, with level 2 flagging judgment to a human) for a `(type, level)`.

### Modified Capabilities

<!-- None — `cli`, `classify`, `assess`, `route`, `ask` behavior unchanged; `verify` is additive. -->

## Impact

- New source: `src/verify/` (oracle-resolution, runner, weighting, verdict), wired into `src/cli/index.ts`.
- Reuse `src/assess/probe.ts` oracle kinds; reuse Stage 0 CLI dispatch.
- New tests: `test/verify.test.ts` (injected runner; no real subprocesses), CLI tests.
- No runtime dependencies (stdlib `node:fs`/`node:child_process`).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — verify is mechanism 4, the quality gate. Scope decoupled from Stage 6: this stage does not accumulate history or do true mutation testing (that needs learn); it implements the deterministic weighted gate. |
| Existing code reuse? | Reuse `src/assess/probe.ts` kinds, Stage 0 dispatch, `RunPlan.checks` shape from `src/route`. |
| Stdlib? | Yes — `node:child_process` (spawn/execFileSync), `node:fs`; no test-runner library. |
| Native platform? | N/A — spawning is the platform primitive; Windows-safe arg passing. |
| New dependency? | No. A task-runner/CI library (e.g. `execa`) is tempting but over-engineering (rung 7: `spawn` + promise-polyfill via stdlib suffices). |

## Complexity

Complexity: **high** — new component (`src/verify/`), subprocess execution, weighting logic, verdict gate, reuses probe. Largest stage so far; kept deterministic and injectable.