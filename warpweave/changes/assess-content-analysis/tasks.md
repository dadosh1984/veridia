## 1. Assess Content Analysis

- [ ] 1.1 Add `test-content` to `OracleKind` in `src/assess/types.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — extend existing union type)
  - **Test first**: `test('OracleKind includes test-content', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [ ] 1.2 Export `isTestsWeak` from `src/verify/weight.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — function exists, just export)
  - **Test first**: `test('isTestsWeak is exported from weight', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [ ] 1.3 Wire test-content probe into `src/assess/probe.ts`
  - **Spec scenario**: Tests with assertions, Empty test files
  - **Ladder rung**: 2 (reuse — call isTestsWeak from probe)
  - **Test first**: `test('probe detects weak test content', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [ ] 1.4 Cap level in `src/assess/map-level.ts` when tests are weak
  - **Spec scenario**: Weak tests cap level
  - **Ladder rung**: 6 (one-liner — add condition to level mapping)
  - **Test first**: `test('level is capped at 2 when tests are weak', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

- [ ] 1.5 Update `warpweave/specs/assess/spec.md` with new test-content oracle
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
