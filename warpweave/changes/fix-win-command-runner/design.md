## Context

See `proposal.md`. On Windows, npm `.cmd`/`.ps1` shims are not directly executable by `execFileSync`, so veridia can't run oracle commands. Fix: a shell fallback for the Windows ENOENT case only.

## Decisions

### 1. Shared launcher `src/util/exec-shim.ts`
`execFileWithShim(cmd, args, options)`: try direct `execFileSync`; if `process.platform === 'win32'` and the error is `ENOENT`, retry once with `{ shell: true }` and return. Otherwise rethrow. Minimal surface, no behavior change on Unix.

### 2. Use it in `runCommand` and `delegateShell`
Both replace their direct `execFileSync` calls with `execFileWithShim`, keeping their existing try/catch + exit-code mapping.

## Tasks

- [ ] 1.1 Add `execFileWithShim` to `src/util/exec-shim.ts`
  - **Ladder rung**: 2 (reuse — one helper shared by two call sites)
  - **Test first**: `test('execFileWithShim falls back to shell on Windows ENOENT', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/exec-shim.test.ts`

- [ ] 1.2 Use it in `src/verify/run.ts` and `src/execute/delegate.ts`
  - **Ladder rung**: 2 (reuse — swap the call)
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [ ] 1.3 Loosen the spawn-failure assertion in `test/verify.test.ts` (non-zero, not `===1`)
  - **Ladder rung**: 1 (YAGNI — platform-robust assertion)
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`
