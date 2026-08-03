## Why

Stage 1 sorts the task; Stage 2 answers the deeper question — **can the result actually be verified?** This is the crux of veridia: everything downstream (orchestration depth, model routing, trust) is gated on verifiability level 0–3. We decide by *probing the repository*, not by guessing from the prompt (see docs/verifiability.md). This stage builds the mechanical probe.

## What Changes

- New `assess` subcommand: `veridia assess --target <path>` probes the target directory/repo and returns a verifiability level (0–3) + the list of detected oracles.
- Verifiability levels (Axis A): `none` (0), `human` (1), `partial` (2), `full` (3).
- Mechanical probe detects: test runner presence, tests touching the target, CI config, type-check config, lint config, and a determinism heuristic on the task (deterministic task → strengthens to 3).
- Oracle list: names the sources of truth found (test runner, compiler/types, lint, CI), with their detected kind (Axis B).
- Deterministic, filesystem-only, stdlib-based — no model, no network (roadmap: early stages need no external AI).
- **BREAKING**: none — additive subcommand.

## Capabilities

### New Capabilities
- `assess`: the veridia `assess` subcommand — probes a target path, returns verifiability level 0–3 plus detected oracles.

### Modified Capabilities

<!-- None — `cli` and `classify` behavior unchanged; `assess` is additive. -->

## Impact

- New source: `src/assess/` (probe logic + level mapping), wired into `src/cli/index.ts`.
- New tests: `test/assess.test.ts` (fixture-based).
- Existing CLI arg dispatch gains an `assess` branch; no changes to existing behavior.
- No runtime dependencies (filesystem + regex only).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — verifiability is the crux of the whole product; assess is mechanism 2. Scope held to mechanical probes only: no mutation testing yet (that is the verifier-weight step, Stage 5/6), no historical precision yet (that is measure/learn, Stage 6). |
| Existing code reuse? | Reuse Stage 0 CLI skeleton (new `assess` branch) and the Stage 0/1 file layout pattern under `src/`. |
| Stdlib? | Yes — `node:fs` for probing, `fs.existsSync` for config presence, regex over config file contents; deterministic. |
| Native platform? | Node `fs`/`path` cover the filesystem probing; Windows-safe via `path.join` (no hardcoded separators). |
| New dependency? | No runtime dependency. A repo-analysis library (e.g. `projen`/`@manypkg`) would be over-engineering (rung 7: a compact probe set suffices); model-based analysis deferred. |

## Complexity

Complexity: **normal** — new component (`src/assess/`), new public subcommand, fixtures + 4+ files. Full chain: proposal → specs → design → tasks.
