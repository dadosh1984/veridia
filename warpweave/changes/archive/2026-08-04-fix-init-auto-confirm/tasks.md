## 1. Stale-input guard for checkboxSelect

- [x] 1.1 Add `readyDelayMs` option and ready-window guard to `src/prompts/checkbox-select.ts`
  - **Ladder rung**: 1 (YAGNI — add a time window and early return)
  - **Test first**: `test('ignores a confirming enter received within the ready delay', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`

- [x] 1.2 Keep existing tests green with `readyDelayMs: 0`
  - **Ladder rung**: 1 (YAGNI — test-option)
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`

