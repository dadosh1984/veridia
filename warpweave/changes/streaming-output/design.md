## Context

See proposal.md — Why. Currently `execFileWithShim` uses `stdio: ['ignore', 'pipe', 'pipe']` — both stdout and stderr are captured silently. The user sees no gate progress until the final verdict. The fix is to add a `streamOutput` option that inherits stderr to the parent process, so gate output appears in real-time.

## Goals / Non-Goals

**Goals:**
- `--verbose` flag on `run`, `verify`, `develop` commands streams gate stderr in real-time
- Non-verbose mode preserves existing captured behavior
- Machine mode (`--json`, `--auto`, MCP) always captures, never streams

**Non-Goals:**
- Not changing the async/sync nature of the pipeline (streaming via `spawnSync` stdio inheritance, not async `spawn`)
- Not adding a logging framework
- Not streaming stdout (only stderr — gate diagnostics are on stderr; stdout is captured for result parsing)

## Decisions

### Decision 1: stderr inheritance via stdio option

Add `streamOutput?: boolean` to `execFileWithShim` options. When true, use `stdio: ['ignore', 'inherit', 'pipe']` — stderr inherits the parent's stderr (real-time streaming), stdout is still captured. When false, use `['ignore', 'pipe', 'pipe']` (current behavior).

Alternatives considered:
- **Async `spawn` with event listeners** — rejected: requires making `runCommand`/`verify` async, cascading through the entire pipeline. The stdio inheritance approach is synchronous and minimal.
- **Always stream stderr** — rejected: would change behavior for machine-mode consumers.

### Decision 2: pass through from CLI to exec-shim

`--verbose` CLI flag → `handle()` opts → `verify()` deps → `runCommand()` → `execFileWithShim()` options. Each layer passes `streamOutput` through.

## Risks / Trade-offs

- [stderr inheritance means gate stderr interleaves with veridia's own stderr] → Mitigation: this is the desired behavior — the user sees gate progress mixed with veridia diagnostics, all on stderr, never on stdout.
- [Windows compatibility] → Mitigation: `spawnSync` stdio inheritance works identically on Windows.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| stderr streaming | 3 (Stdlib) | `spawnSync` stdio `['ignore', 'inherit', 'pipe']` |
| --verbose flag | 2 (Reuse) | Same pattern as --dry-run, --force |
| pass-through wiring | 2 (Reuse) | Existing deps/opts pattern |
