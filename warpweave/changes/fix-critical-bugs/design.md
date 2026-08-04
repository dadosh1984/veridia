## Context

See `proposal.md`. Two low-risk hardening fixes come from the external audit: verify doesn't say *why* a check failed, and the ask loop creates a fresh `readline` interface per question.

## Decisions

### 1. Additive failure text on a check (keep protocol /v1)
`runCommand` should capture the child's stderr/error message and return it; `verify()` copies it onto `Check.error` (optional). The verdict logic in `deriveVerdict` is untouched, so `veridia/verification-report/v1` stays `/v1` — adding an optional field is backward-compatible. This is the anti-theater complement: a `FAIL` should be explainable, not a bare signal.

- `RunResult` gains `error?: string` (and keeps `exitCode`).
- `runCommand` already calls `execFileSync` with captured output — surface the error text from the throw (e.g. `err.stderr` or the ENOENT/EACCES message) instead of discarding it.
- `Check` in `verify/types.ts` gains `error?: string`.
- `verify()` (`src/verify/verify.ts:41-47`) keeps its `catch { exitCode = 1 }` mapping but also records the reason.

### 2. One `readline` interface per ask run
`promptQuestions` is already the loop boundary. Hoist `createInterface` there and pass the single interface into `promptQuestion`; close it after the loop. Removes per-question create/close churn and is stable under piped stdin.

## Deferred (separate spike, not in this change)

- **Async FS walk** in `collectTestFiles` (`weight.ts:29`) — real but conflicts with `verify()`'s synchronous design; a proper fix makes `verify` async end-to-end. Tracked elsewhere, not here.

## Tasks

- [ ] 1.1 Surface failure reason on `RunResult` in `src/verify/run.ts`
  - **Ladder rung**: 2 (reuse — extend existing return shape)
  - **Test first**: `test('runCommand returns stderr on failure', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [ ] 1.2 Add optional `error` to `Check` in `src/verify/types.ts`
  - **Ladder rung**: 1 (YAGNI — additive field)
  - **Test first**: `test('Check carries error text', ...)`
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.3 Propagate failure reason into `Check.error` in `src/verify/verify.ts`
  - **Ladder rung**: 2 (reuse — pass through)
  - **Test first**: `test('verify reports why a check failed', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [ ] 1.4 Hoist a single `readline` interface in `src/ask/prompt.ts`
  - **Ladder rung**: 1 (minimal — hoist existing object)
  - **Test first**: `test('promptQuestions asks multiple questions on one interface', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`
