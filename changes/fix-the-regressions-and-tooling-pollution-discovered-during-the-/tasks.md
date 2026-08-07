# Tasks — fix-the-regressions-and-tooling-pollution-discovered-during-the-

- [x] Restore the accidentally removed `cli.parse()` call in `src/cli/index.ts` with clean error handling, and add a regression test (`test/cli/cli.test.ts`) so a silent removal cannot recur.
- [x] Fix the malformed indentation + import ordering of the `veridia_measure` record block in `src/mcp/index.ts` (restores lint cleanliness).
- [x] Remove the ~196 untracked `.scaled.ts` / `.scaled.scaled.ts` scratch files under `src/` plus the broken `src/tasks/` and root `tests/` scaffold files that broke `pnpm lint` and `tsc --noEmit` (CI was red).
- [x] Add `.gitignore` coverage for `*.scaled*.ts`, `src/tasks/`, and root `tests/` so the scale/forge tooling can never re-pollute the tree.
- [x] Complete the MCP feedback loop (Stage 6 — measure): `veridia_session_do` now persists its outcome to `.veridia/history.jsonl` via `measureRecord`.
- [x] Make `veridia_session_archive` archive without losing data: it persists any un-recorded verdict before clearing the session, and never duplicates a `session-do`-recorded outcome.
- [x] Add MCP tests covering the recorded history entry and the no-duplicate archive behavior.
