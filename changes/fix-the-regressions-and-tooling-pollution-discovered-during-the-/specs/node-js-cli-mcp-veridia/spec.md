# Change spec — Node.js CLI & MCP maintenance fixes

## Purpose
Restore the veridia CLI/MCP to a green, clean state after an audit found a removed
`cli.parse()`, malformed MCP formatting, tooling pollution (`*.scaled*.ts`, `src/tasks/`,
`tests/`), and a missing MCP feedback loop. Deliverable: green CI (lint + typecheck +
tests), a clean repo tree, and an MCP session lifecycle that records outcomes.

## Acceptance criteria
- [x] `src/cli/index.ts` invokes `cli.parse()`; CAC errors print a clean message and exit
      non-zero. Regression test asserts a real command emits output and an unknown option
      exits 1.
- [x] `src/mcp/index.ts` passes `biome check` (correct indentation and sorted imports).
- [x] No `*.scaled.ts` / `*.scaled.scaled.ts` files remain under `src/`; `src/tasks/` and
      root `tests/` are removed; `.gitignore` covers all three so they cannot return.
- [x] `veridia_session_do` appends one entry to `.veridia/history.jsonl` containing the
      task, type, level, and verdict of the run.
- [x] `veridia_session_archive` deletes the session file and does not write a duplicate
      history entry for an outcome already recorded by `session_do`.
- [x] `pnpm lint`, `tsc --noEmit`, `pnpm build`, and `pnpm test` all pass (340 tests).
