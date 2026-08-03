## 1. Security — Command Injection Fix

- [x] 1.1 Fix `src/verify/run.ts`: remove `shell: true`, split command into args, handle `signal` in error
  - **Ladder rung**: 3 (stdlib — `execFileSync` with args array)
  - **Test first**: `test('runCommand rejects shell metacharacters', () => { ... })`
  - **Verify**: `vitest test/verify.test.ts`

## 2. OOM & JSONL Robustness

- [x] 2.1 Fix `src/measure/history.ts`: use `readline` streaming instead of `readFileSync` + `split`, add try/catch per line
  - **Ladder rung**: 3 (stdlib — `node:readline`)
  - **Test first**: `test('readHistory handles corrupted lines', () => { ... })`
  - **Verify**: `vitest test/measure.test.ts`

## 3. DI Seam for resolve.ts

- [x] 3.1 Add `FsLike` injectable parameter to `readScript` in `src/verify/resolve.ts`
  - **Ladder rung**: 2 (reuse — same pattern as `probe.ts`)
  - **Test first**: `test('resolveCommands with injected FsLike', () => { ... })`
  - **Verify**: `vitest test/verify.test.ts`

## 4. CLI Parser Refactor

- [x] 4.1 Add shared `parseFlags` helper to `src/cli/index.ts` and replace 6 duplicated arg loops
  - **Ladder rung**: 2 (reuse — shared helper, same pattern)
  - **Test first**: `test('parseFlags parses --key value pairs', () => { ... })`
  - **Verify**: `vitest test/cli.test.ts`

## 5. Test Detection & selectQuestions

- [x] 5.1 Fix `src/verify/weight.ts`: add `__tests__/`/`test/`/`tests/` directory detection, add try/catch to `collectTestFiles`
  - **Ladder rung**: 2 (reuse — same `collectTestFiles` with added dirs)
  - **Test first**: `test('isTestsWeak detects tests in __tests__ dir', () => { ... })`
  - **Verify**: `vitest test/verify.test.ts`

- [x] 5.2 Fix `src/ask/select.ts`: merge duplicate `EXPECTED_OUTCOME_QUESTION` conditions
  - **Ladder rung**: 6 (one-liner — single condition merge)
  - **Test first**: `test('selectQuestions adds EXPECTED_OUTCOME once', () => { ... })`
  - **Verify**: `vitest test/ask.test.ts`
