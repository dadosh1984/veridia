## Why

When veridia runs verification gates (vitest, tsc, lint), the child process stdout is captured silently and only surfaced on failure. Long-running gates show zero progress — the user sees a spinner or blank output until the gate completes. For a tool whose whole premise is "verifiability", hiding gate output until the end undermines trust: the user can't see which tests are passing, which lints are failing, or whether the process is making progress.

## What Changes

- Add `--verbose` flag to `veridia run`, `veridia verify`, and `veridia develop` that streams child process stdout/stderr in real-time
- In non-machine mode (interactive TTY), gate output is streamed to stderr by default (visible to the user, never pollutes JSON stdout)
- In machine mode (`--json`, `--auto`, MCP), gate output remains captured and only surfaced on failure (existing behavior preserved)
- No new library functions — reuse `spawnSync` with `stdio: ['ignore', 'inherit', 'pipe']` for stderr streaming, or add a `spawn`-based streaming variant

## Capabilities

### New Capabilities
- `streaming-output`: Real-time streaming of verification gate output to stderr during execution, with `--verbose` flag for explicit control

### Modified Capabilities
- (none — no spec-level behavior changes to existing capabilities; streaming is additive)

## Impact

- `src/verify/run.ts` — add `streamOutput?: boolean` to `RunFn` or add a streaming variant
- `src/verify/verify.ts` — pass streaming flag through to `runCommand`
- `src/cli/commands/run.ts` — add `--verbose` flag, wire to verify
- `src/cli/commands/verify.ts` — add `--verbose` flag
- `src/cli/commands/develop.ts` — add `--verbose` flag
- `test/verify.test.ts` — tests for streaming behavior
- No dependency change

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — invisible gate progress undermines trust in the tool |
| Existing code reuse? | **Yes** — `spawnSync` already used; `spawn` with `stdio` streaming is stdlib |
| Stdlib? | **Yes** — `node:child_process.spawn` with `stdio: ['ignore', 'inherit', 'pipe']` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
