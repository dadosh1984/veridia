## 1. Wire Feedback Loop

- [x] 1.1 Wire `computeSensitivity()` into `triage.ts` — call after verify, pass as deps
  - **Spec scenario**: Sensitivity affects oracle weight
  - **Ladder rung**: 2 (reuse — functions exist, just call them)
  - **Test first**: `test('triage passes sensitivity to verify', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 1.2 Wire `oracleResults` into `measureRecord()` in `triage.ts`
  - **Spec scenario**: Oracle results persisted
  - **Ladder rung**: 2 (reuse — MeasureEntry already has oracleResults field)
  - **Test first**: `test('triage records oracleResults in measure entry', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 1.3 Remove default `sens=1, prec=1` in `verify.ts` — use baseWeight when no calibration
  - **Spec scenario**: No calibration data
  - **Ladder rung**: 6 (one-liner — change default from 1 to baseWeight)
  - **Test first**: `test('verify uses baseWeight when no calibration deps', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.4 Add e2e test: verify that sensitivity + precision affect verdict
  - **Spec scenario**: Sensitivity affects oracle weight, Precision converges
  - **Ladder rung**: 2 (reuse — follow existing e2e test pattern)
  - **Test first**: `test('feedback loop: sensitivity and precision affect verdict', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/e2e.test.ts`

## 2. Assess Content Analysis

- [x] 2.1 Add `test-content` to `OracleKind` in `src/assess/types.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — extend existing union type)
  - **Test first**: `test('OracleKind includes test-content', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [x] 2.2 Export `isTestsWeak` from `src/verify/weight.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — function exists, just export)
  - **Test first**: `test('isTestsWeak is exported from weight', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 2.3 Wire test-content probe into `src/assess/probe.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — call isTestsWeak from probe)
  - **Test first**: `test('probe detects weak test content', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [x] 2.4 Cap level in `src/assess/map-level.ts` when tests are weak
  - **Spec scenario**: Weak tests cap level
  - **Ladder rung**: 6 (one-liner — add condition to level mapping)
  - **Test first**: `test('level is capped at 2 when tests are weak', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [x] 2.5 Update `warpweave/specs/assess/spec.md` with new test-content oracle
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

