## 1. Configurable Weights

- [x] 3.1 Add `weights` to `VeridiaConfig` in `src/config/config.ts`
  - **Ladder rung**: 2 (reuse — extend existing interface)
  - **Test first**: `test('VeridiaConfig accepts weights', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/config.test.ts`

- [x] 3.2 Modify `baseWeight()` in `src/verify/weight.ts` to accept optional config overrides
  - **Ladder rung**: 2 (reuse — modify existing function)
  - **Test first**: `test('baseWeight uses config override', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 3.3 Update `.veridia/config.json` with example weights
  - **Ladder rung**: 1 (YAGNI — config update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [x] 3.4 Update `warpweave/specs/verify/spec.md` with configurable weights requirement
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
