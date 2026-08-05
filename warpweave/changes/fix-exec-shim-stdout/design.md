# Design: fix-exec-shim-stdout

## Context

See proposal.md — Why. The root cause is `execFileWithShim` (`src/util/exec-shim.ts:14,17`) forcing `stdio: ['inherit', 'pipe', 'pipe']`: the child's stdout bypasses veridia entirely and lands directly in the parent's stdout. stderr is already piped, so only stdout needs capture + rerouting. The MCP server compounds it because `StdioServerTransport` (`src/mcp/index.ts:133`) uses process.stdout as its JSON-RPC channel.

## Goals / Non-Goals

**Goals:**
- Machine-readable stdout is always clean: valid JSON, no ANSI, no child output
- Child stdout is captured and (when surfaced) written to stderr
- One consistent "machine mode" determination shared across the CLI

**Non-Goals:**
- Not changing TTY/human output — interactive `run` keeps its clack rendering on stdout
- Not a logging framework — routing only, not formatting/log levels
- Not changing what child commands are run, only where their output goes

## Decisions

### Decision 1: capture stdout in execFileWithShim

Change `stdio` from `['inherit', 'pipe', 'pipe']` to `['ignore', 'pipe', 'pipe']` in both branches (`exec-shim.ts:14,17`). The Windows `shell: true` fallback branch captures the same way. Child stdout becomes available in `result.stdout` (already true for stderr).

### Decision 2: route captured output in the callers

`runCommand` (`src/verify/run.ts`) already reads `e.stderr` for errors; extend it to return captured stdout. `runGates` (`src/execute/delegate.ts:61-81`) same. Each caller decides: in machine mode write captured output to `process.stderr` (or drop it), never to stdout.

### Decision 3: central machine-mode detection

Add `isMachineMode(opts)` in `src/cli/shared.ts`: true when `--json`, `--auto`, or when running under MCP (`VERIDIA_MCP` env set by the MCP entrypoint, or a passed flag). All gate callers consult it. This keeps routing consistent instead of per-command heuristics.

Alternatives considered:
- **TTY detection only** — rejected: `--json` piped through a pager/CI still has a TTY on some setups; explicit flags are the reliable signal.

### Decision 4: MCP entrypoint pins machine mode

`src/mcp/index.ts` sets machine mode unconditionally (MCP is always a machine consumer). The verify tool's `verify()` call then captures gate output and routes it to stderr, keeping the JSON-RPC channel byte-clean.

## Risks / Trade-offs

- [Interactive users lose live gate output on stdout] → Mitigation: route captured output to stderr so it still appears in a terminal; `--verbose` may also expose it. Interactive `run` path (clack) is untouched.
- [Big child stdout buffered in memory] → Mitigation: gates are bounded (120s timeout, verifier output is small); for the rare huge output, cap the captured buffer.
- [A caller somewhere still writes to stdout] → Mitigation: canary tests (below) catch regressions; grep-audit in tasks.

## Migration Plan

Single change. Rollback = revert; the behavioral risk is limited to output routing.

## Open Questions

None. Machine-mode semantics are defined by flags/env; routing behavior is fully specified by the machine-output spec.
