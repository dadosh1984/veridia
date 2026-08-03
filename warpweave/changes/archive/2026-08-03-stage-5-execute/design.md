## Context

- See proposal.md - Why; specs/verify/spec.md - behavior contract.
- Existing code: `src/assess/probe.ts` detects oracle kinds; `src/cli/index.ts` is a flat argv dispatcher with five branches (classify/assess/route/ask); `src/route/` produces `RunPlan.checks`. Stage 5 is the first that executes real subprocesses.
- Constraints (AGENTS.md): TDD; stdlib only; deterministic; build = `pnpm build`, tests boot compiled `dist/cli/index.js`; Windows-safe paths and arg passing.
- Scope (user-confirmed): deterministic weighted `verify`; mutation/history weighting deferred to Stage 6.

## Goals / Non-Goals

**Goals:**
- `src/verify/` module: resolve detected oracles to commands, run them via an injectable runner, weigh results under the theater guard, derive a gated verdict.
- Reuse Stage 2 oracle kinds and the local-only guarantee; cross-tests run against an injected runner (no real subprocesses in unit tests) except the manual smoke.

**Non-Goals:**
- Actually accumulating history, real mutation-testing of the target, or automated learn (Stage 6).
- Running remote/model checks or network services.
- Generating or fixing code (that is the `do` phase, out of scope this stage).

## Decisions

**D1. Component split in `src/verify/`.**
- `types.ts` — `Check { kind; command; weight; passed }`, `Verdict = 'PASS' | 'FAIL' | 'HUMAN'`, `VerifyResult { checks: Check[]; verdict: Verdict }`, and `Weakness` tags.
- `resolve.ts` — kinds → command strings: read `package.json` scripts (`test`/`typecheck`/`lint`) with runnable defaults (`tsc --noEmit`, `eslint .`).
- `run.ts` — `runCommand(target, command, run)` via a `run` seam (`(cwd, cmd) => { exitCode }`), defaulting to stdlib `child_process.execFileSync`.
- `weight.ts` — static weight per kind (test-runner=3, type-check=2, lint=1), downgraded to `weak` when tests are empty/assert-less.
- `verify.ts` — orchestrates resolve→run→weigh→`deriveVerdict`.
Reuse `probeOracles` and `OracleKind` from `src/assess/probe.js` (type-only import for kind).
- Alternatives: a monolithic `verify.ts` (rejected — subprocess + weighting + verdict deserve isolated tests).

**D2. Weakness detection is mechanical, judgment-free.**
The theater guard reads the target's test files and flags the `test-runner` oracle weak when it finds no `test`/`it`/`expect`/`assert` tokens across the discovered test files. No AI, no opinion — a token scan. An empty target (no tests) yields zero checks → HUMAN.
- Alternatives: weighting by actual coverage or mutation runs (rejected — needs Stage 6 learn; over-engineering now).

**D3. Verdict is a pure function of (level, weighted checks).**
`deriveVerdict(level, checks)`:
- level 0/1 → `HUMAN` (always; run reported, no pass/fail).
- level 3 → PASS iff every strong oracle passed; any strong failure → FAIL.
- level 2 → PASS iff every runnable (non-CI) check passed; judgment flagged for human.
Deterministic, no I/O.
- Alternatives: fold verdict into `verify.ts` (rejected — keeping it pure eases table-driven tests).

**D4. `run` seam keeps tests deterministic and offline.**
`run.ts` exports a default real runner (`execFileSync` via `node:child_process`) and a hook the corpus injects to simulate exit codes. This satisfies "offline operation" and "repeated runs agree" without spawning processes.
- Alternatives: mocking `child_process` at the module level (rejected — explicit seam is clearer than a mock library).

**D5. CLI `verify` branch mirrors `route`/`ask`.**
Require `--target <path>` (positional allowed), `--type`, `--level`, all validated; missing target path → stderr + exit 1; otherwise print one line per check + a verdict line, exit 0.
- Alternatives: JSON (rejected — heavier than current tab-style CLI).

## Risks / Trade-offs

- [Subprocess could hang on a long test run] → Mitigation: `execFileSync` with a bounded timeout; a hung command surfaces as a FAIL, never a hang.
- [Weakness scan might misread a valid exotic test DSL] → Mitigation: the scan is deliberately token-based and its false "weak" is safe (defers judgment to human); never false-strong.
- [Reading arbitrary `package.json` scripts could run unintended commands] → Mitigation: only `test`/`typecheck`/`lint`/`type-check` are ever executed; no arbitrary script invocation.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| resolve kinds→commands | 3 Stdlib | read `package.json` (node:fs), defaults |
| runner | 3 Stdlib | `child_process.execFileSync` + injectable seam |
| weakness scan | 3 Stdlib | regex token scan over test files |
| verdict | 7 Minimum | pure `deriveVerdict(level, checks)` |
| CLI dispatch | 2 Reuse | new `verify` branch in `src/cli/index.ts` |
| Output | 2 Reuse | per-check lines + verdict, tab style |
| Tests | 2 Reuse | injected runner corpus + tmp-dir fixtures |