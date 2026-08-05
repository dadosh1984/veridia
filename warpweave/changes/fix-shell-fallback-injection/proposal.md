## Why

`execFileWithShim` falls back to `spawnSync(shellCmd, [], { shell: true })` on Windows when the command is not found directly (`src/util/exec-shim.ts:16-17`). This has two defects:

1. **Self-flagging**: `src/analyze/checks.ts:9` flags `shell\s*:\s*true` as an ERROR ("potential command injection") — so `veridia report --target .` on this repo returns that finding against veridia's own `exec-shim.ts`. The tool flags its own code.
2. **Real injection/quoting risk**: the fallback joins args with `p.includes(' ') ? `"${p}"` : p` — only quotes args containing a space, with no escaping of `"`, `$`, backticks, `;`, `&`. A path or task containing special characters is mis-split or can break out of the quote, on Windows.

## What Changes

- Remove `shell: true` from the Windows fallback entirely
- Replace it with native shim resolution: resolve `.cmd`/`.exe`/`.bat` via `PATHEXT` against `PATH` and `node_modules/.bin`, then run the resolved executable with `spawnSync` and `shell: false`
- Reuse the existing split-command/exec-shim callers unchanged; behavior for legit commands is identical
- Self-flag resolves: no `shell: true` remains in the codebase

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `host-agent-delegation`: the "Fallback to generic shell" requirement now resolves Windows command shims natively instead of via a raw `shell: true` invocation

## Impact

- `src/util/exec-shim.ts` — replace shell fallback with PATHEXT-based resolution
- `src/execute/detect.ts` — generic-shell fallback path (runs through exec-shim) unchanged at the call site
- `test/exec-shim.test.ts` — new tests for `.cmd`/`.exe` resolution, special-char args, no-shell guarantee
- Self-report: `veridia report --target .` no longer contains the `shell: true` self-flag

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — injection risk on Windows + self-flagging |
| Existing code reuse? | **Yes** — `splitCommand` already splits args safely; `delegate.ts` already runs `node_modules/.bin` on PATH |
| Stdlib? | **Yes** — `child_process.spawnSync` with `shell: false`; `PATHEXT`/`PATH` env; `fs.existsSync` |
| Native platform? | **Yes** — Windows `.cmd` shim semantics are the platform feature being leveraged |
| New dependency? | **No** — rejects `cross-spawn` (rung 5): the stdlib PATHEXT walk covers `.cmd`/`.exe`/`.bat` resolution without a new package |

## Complexity

Complexity: **normal**
