## Context

See proposal.md — Why. The `triage()` function in `src/triage/triage.ts` already runs the full pipeline (classify → assess → route → ask → execute → verify → measure). The `run` command (`src/cli/commands/run.ts`) wraps it for human-readable output. The gap is a command that runs triage against a warpweave change and reports the cycle result as JSON, suitable for CI dogfooding.

## Goals / Non-Goals

**Goals:**
- `veridia develop --change <name>` runs triage against the change's proposal description
- Result is recorded to history and printed as JSON
- CI dogfooding steps replaced with `veridia develop`

**Non-Goals:**
- Not adding new library functions — reuse `triage()`, `verify()`, `measureRecord()`
- Not changing the triage pipeline itself
- Not adding interactive prompts (CI mode only)

## Decisions

### Decision 1: thin CLI wrapper over triage()

`veridia develop` is a new CLI command handler (`src/cli/commands/develop.ts`) that:
1. Reads the change's `proposal.md` first line as the task description
2. Calls `triage(task, changeDir, { auto: true })`
3. Records the result via `measureRecord()`
4. Prints JSON summary to stdout

Alternatives considered:
- **Reuse `run` command with `--ww --change`** — rejected: `run` has clack output and interactive prompts; `develop` is CI-oriented with JSON output only.

### Decision 2: task description from proposal

The first non-empty line of `proposal.md` (after stripping `## Why` header) becomes the task string for triage. This keeps the change's own description as the triage input.

### Decision 3: CI replacement

Replace the 5 ad-hoc dogfooding steps in `.github/workflows/ci.yml` with a single `veridia develop --change <name>` step per change. For now, use a placeholder change name that runs triage against the repo root.

## Risks / Trade-offs

- [Proposal first line may be too short for meaningful triage] → Mitigation: triage works on any task string; short descriptions get lower confidence but still run.
- [CI dogfooding steps are replaced, not augmented] → Mitigation: the single `develop` command covers classify + assess + verify + measure in one step, which is more comprehensive than the current ad-hoc steps.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| develop command handler | 2 (Reuse) | `triage()` already exists; thin wrapper |
| task description from proposal | 3 (Stdlib) | `readFileSync` + string split |
| CI replacement | 2 (Reuse) | existing workflow file, replace step |
