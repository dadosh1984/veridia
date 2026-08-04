## 1. Human-readable interactive init output

- [x] 1.1 Add pure `formatInitSummary(setup)` returning a human-readable summary in `src/cli/commands/init.ts`
  - **Ladder rung**: 1 (YAGNI — string builder)
  - **Test first**: `test('formatInitSummary renders agent counts and config line', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/init.test.ts`

- [x] 1.2 Branch init output: human summary when interactive, JSON when `--agent`
  - **Ladder rung**: 2 (reuse — reuse existing jsonOut for non-interactive)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

