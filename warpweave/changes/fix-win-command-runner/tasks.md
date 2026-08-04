## 1. Windows command-runner fix

- [x] 1.1 Add `execFileWithShim` to `src/util/exec-shim.ts`
  - **Ladder rung**: 2 (reuse — one helper shared by two call sites)
  - **Test first**: `test('execFileWithShim falls back to shell on Windows ENOENT', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/exec-shim.test.ts`

- [x] 1.2 Use it in `src/verify/run.ts` and `src/execute/delegate.ts`
  - **Ladder rung**: 2 (reuse — swap the call)
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.3 Loosen the spawn-failure assertion in `test/verify.test.ts` (non-zero, not `===1`)
  - **Ladder rung**: 1 (YAGNI — platform-robust assertion)
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

