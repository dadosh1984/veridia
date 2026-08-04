## 1. Hardening fixes from the audit

- [x] 1.1 Surface failure reason on `RunResult` in `src/verify/run.ts`
  - **Ladder rung**: 2 (reuse — extend existing return shape)
  - **Test first**: `test('runCommand returns stderr on failure', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.2 Add optional `error` to `Check` in `src/verify/types.ts`
  - **Ladder rung**: 1 (YAGNI — additive field)
  - **Test first**: `test('Check carries error text', ...)`
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [x] 1.3 Propagate failure reason into `Check.error` in `src/verify/verify.ts`
  - **Ladder rung**: 2 (reuse — pass through)
  - **Test first**: `test('verify reports why a check failed', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.4 Hoist a single `readline` interface in `src/ask/prompt.ts`
  - **Ladder rung**: 1 (minimal — hoist existing object)
  - **Test first**: `test('promptQuestions asks multiple questions on one interface', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`
