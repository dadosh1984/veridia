## Why

veridia's core thesis is that quality comes from process (triage + verifiable steps + self-measurement), not from the model. Yet veridia's own development is driven by ad-hoc agent sessions, not by its own triage pipeline. The dogfooding CI steps (`ci.yml:33-42`) run isolated commands (`run`, `verify`, `learn`, `measure`) but never the full loop: a change is proposed → triaged → implemented → verified → measured → the result feeds the next cycle. Closing this gap is the project's own "trust the process" proof point.

## What Changes

- Add `veridia develop` command that wraps the full dogfooding cycle for a warpweave change: triage the change description → run gates → verify → measure → report
- Wire the triage result (verdict, drift, precision) back into the next `develop` cycle via history
- Add `--change <name>` mode to `veridia develop` that reads the change's proposal, runs triage on it, executes gates, and archives on PASS
- Update CI dogfooding step to use `veridia develop --change <name>` instead of ad-hoc commands
- No new library functions — reuse `triage()`, `verify()`, `measureRecord()`, `readHistory()`, session pipeline

## Capabilities

### New Capabilities
- `self-dogfooding`: Full end-to-end dogfooding loop — `veridia develop` triages a change, runs gates, verifies, measures, and reports the cycle result

### Modified Capabilities
- (none — no spec-level behavior changes to existing capabilities; the triage/verify/measure pipeline is unchanged, only the orchestration is new)

## Impact

- `src/cli/commands/develop.ts` (new) — `veridia develop` command handler
- `src/cli/index.ts` — register `develop` command
- `.github/workflows/ci.yml` — replace ad-hoc dogfooding steps with `veridia develop`
- `test/develop.test.ts` (new) — e2e tests for the develop cycle
- No dependency change

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — the project's own thesis demands dogfooding; ad-hoc CI steps are not the full loop |
| Existing code reuse? | **Yes** — `triage()`, `verify()`, `measureRecord()`, `readHistory()`, `buildSummary()`, session pipeline all exist |
| Stdlib? | **Yes** — `node:fs`, `node:child_process` for any new shell work |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
