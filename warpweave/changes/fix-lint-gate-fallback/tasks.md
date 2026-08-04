## 1. Fix lint gate fallback

- [x] 1.1 Scope the `vitest run` fallback to `test-runner` gates in `src/execute/plan.ts`
  - **Ladder rung**: 1 (YAGNI — one-line fallback change)
  - **Test first**: `test('lint gate has empty command; test gate falls back to vitest run', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

