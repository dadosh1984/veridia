## Why

veridia's `verify`/`run`/`execute` cannot run the project's own oracle commands on **Windows**: the resolved commands (`pnpm test`, `tsc --noEmit`, `eslint .`) resolve to npm `.cmd`/`.ps1` shims in `node_modules/.bin`, and `execFileSync(cmd, args)` without a shell fails with `ENOENT` for those. The digit of the pipeline (execute → verify → measure, and live progress) dies mid-run on Windows. This is a real tool bug, not a project problem.

## What Changes

- Add a shared command launcher that falls back to a shell **only on Windows when direct exec yields `ENOENT`** (i.e. when the command is an npm `.cmd` shim). Unix/macOS and non-shim Windows commands keep direct exec (no shell — no injection).
- Use it in `src/verify/run.ts` (`runCommand`) and `src/execute/delegate.ts` (`delegateShell`).

## Capabilities

### New Capabilities
- none (tooling/bugfix — `skip_specs: true`)

## Impact

| Area | Impact |
|------|--------|
| `src/util/exec-shim.ts` (new) | Cross-platform exec with Windows `.cmd`-shim fallback |
| `src/verify/run.ts` | `runCommand` uses the shared launcher |
| `src/execute/delegate.ts` | `delegateShell` uses the shared launcher |
| `test/verify.test.ts` | Loosen the spawn-failure assertion to be platform-robust |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — reported bug; oracles fail on Windows |
| Existing code reuse? | **Yes** — one shared launcher used by both call sites |
| Stdlib? | **Yes** — `child_process.execFileSync` + `process.platform` |
| New dependency? | **No** |
| Note | Shell used only as a Windows `.cmd`-shim fallback on ENOENT, never by default |

## Complexity

Complexity: **normal** (new helper + two call sites + test)
