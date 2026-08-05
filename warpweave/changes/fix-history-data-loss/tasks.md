## Tasks

### 1. RED — failing tests for corrupt-line reporting

- [x] Test: history with 9 valid + 1 corrupt line → `measure --history` reports 9 runs AND writes a "skipped 1 corrupt line" warning to stderr
- [x] Test: all-valid history → no warning on stderr
- [x] Test: trailing blank lines → no warning, full count
- [x] Test: CRLF line endings parse correctly (Windows parity)

**Verify:** `pnpm exec vitest run test/measure.test.ts` — new tests fail before fix

### 2. GREEN — streaming + reporting in history.ts

- [x] Add `parseHistoryLines(content): { entries, skipped }` helper (per-line `JSON.parse`, count failures, ignore blank lines)
- [x] Convert `readHistory` to async `readline` streaming (`createReadStream` + `for await...of`, `crlfDelay: Infinity`), returning `Promise<MeasureEntry[]>`
- [x] Update call sites with `await`: `src/measure/learn.ts`, `src/mcp/index.ts:113`, `src/cli/commands/measure.ts`
- [x] CLI `measure --history` prints skip warning to stderr when `skipped > 0`

**Verify:** `pnpm exec vitest run test/measure.test.ts test/learn.test.ts` — all pass

### 3. Close the drift

- [x] Update `warpweave/changes/archive/2026-08-03-fix-audit-issues/tasks.md` task 2.1 to reference this change as the actual implementation

**Verify:** archived task now points at `fix-history-data-loss`

### 4. Regression

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`
- [x] Manual: inject a corrupt line into `.veridia/history.jsonl` on a scratch repo, run `veridia measure --history`, confirm stderr warning

**Verify:** full test suite green + manual check
