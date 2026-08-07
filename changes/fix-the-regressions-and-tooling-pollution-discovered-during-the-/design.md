# Design — fix-the-regressions-and-tooling-pollution-discovered-during-the-

## Overview
Fixes regressions and tooling pollution surfaced by an audit of the veridia CLI/MCP
codebase, then completes the MCP session→history feedback loop. No new CLI surface;
all work is corrective and verifiable through the existing CI pipeline.

## Root causes
1. A botched autonomous edit removed `cli.parse()` from `src/cli/index.ts` and left a
   dead nested try/catch (marked `// Remove invalid call`). CAC never ran, so every
   command exited 0 silently → ~60 test failures.
2. A malformed `if (mode === 'record')` block in `src/mcp/index.ts` broke formatting/import
   sort (2 lint errors).
3. The Orion scale/forge tools wrote ~196 `*.scaled*.ts` scratch files into `src/`, plus
   `src/tasks/` and root `tests/` `assumption_*` scaffolds. `tsc --noEmit` (includes
   `src/**/*.ts`) and `biome check src/` both fail on them → CI red.
4. MCP session lifecycle never wrote outcomes to history: `session_do` dropped the
   verify result, and `session_archive` only cleared the session file.

## Changes
- `src/cli/index.ts` — restore `cli.parse()` inside a try/catch that prints a clean
  message and exits 1 on CAC errors.
- `src/mcp/index.ts` — fix `veridia_measure` record indentation; `veridia_session_do`
  calls `measureRecord(...)`; `veridia_session_archive` archives a lingering verdict
  (when `step !== 'done'`) before `clearSession`.
- `.gitignore` — ignore `*.scaled*.ts`, `src/tasks/`, root `tests/`.
- Delete all `*.scaled*.ts` under `src/` and the `src/tasks/` + `tests/` directories.
- Tests: CLI regression (commands execute / `cli.parse` runs) and MCP feedback-loop
  (history entry recorded; archive does not duplicate).

## Modules touched
`src/cli/index.ts`, `src/mcp/index.ts`, `.gitignore`, `test/cli/cli.test.ts`, `test/mcp.test.ts`.

## Verification
- [x] lint (`pnpm lint`)
- [x] type-check (`tsc --noEmit`)
- [x] unit tests (`pnpm test`) — 340 passing
