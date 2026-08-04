## 1. Live run progress

- [x] 1.1 Add optional `progress` to `TriageOptions` and invoke at each stage in `src/triage/triage.ts`
  - **Ladder rung**: 2 (reuse — existing stage calls)
  - **Test first**: `test('triage emits progress across stages', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 1.2 Wire `run.ts` to print `→ <stage>` lines via progress to stdout
  - **Ladder rung**: 1 (YAGNI — a few write calls)
  - **Test first**: covered by 1.1 + CLI e2e
  - **Verify**: `rtk pnpm exec tsc --noEmit`
