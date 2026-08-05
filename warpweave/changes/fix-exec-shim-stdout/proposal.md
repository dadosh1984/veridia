## Why

`execFileWithShim` hardcodes `stdio: ['inherit', 'pipe', 'pipe']` (`src/util/exec-shim.ts:14,17`), so every gate process (vitest, tsc, lint) streams its raw stdout into the same stdout where veridia later writes its JSON result. Reproduced: `veridia <task> --target .` and `veridia analyze --target .` both emit ANSI banners interleaved with JSON. Worse, the MCP server uses a stdio transport (`src/mcp/index.ts:133`) where stdout IS the JSON-RPC channel — a gate with real tests can desync/break the MCP session.

## What Changes

- `execFileWithShim` captures child stdout instead of inheriting it
- Child stdout is routed to veridia's stderr (or suppressed) — machine-readable stdout stays clean
- New contract: in `--json` / `--auto` / MCP contexts, veridia stdout is valid JSON with no ANSI
- A canary test enforces the contract: stdout under machine modes is always parseable JSON (an oracle, per verifiability philosophy, not developer memory)

## Capabilities

### New Capabilities
- `machine-output`: veridia keeps stdout clean for machine consumers (JSON mode, --auto, MCP); all diagnostic and child-process output is routed to stderr

### Modified Capabilities
- (none — this is a cross-cutting output discipline, not a change to an existing capability's requirement set; `cli` spec's "prints usage to stdout" and "rejects unknown flags to stderr" are unaffected)

## Impact

- `src/util/exec-shim.ts` — capture stdout instead of inherit; expose captured output to callers
- `src/verify/run.ts` — `runCommand` returns captured stdout; route to stderr under machine modes
- `src/execute/delegate.ts` — `runGates` same treatment
- `src/mcp/index.ts` — verify tool output no longer leaks into the JSON-RPC channel
- `src/cli/shared.ts` — central "machine mode" detection (--json / --auto / MCP env) so routing is consistent
- `test/` — canary tests asserting stdout purity

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — P0: breaks MCP sessions and machine consumers |
| Existing code reuse? | **Yes** — stderr routing already used for diagnostics (`fix.ts:11`, `delegate.ts:102`) |
| Stdlib? | **Yes** — `child_process.spawnSync` captures stdout via `stdio: ['ignore', 'pipe', 'pipe']` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
