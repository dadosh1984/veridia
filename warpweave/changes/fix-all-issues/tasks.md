## 1. Critical Bug Fixes

- [ ] 1.1 Fix `calibrateWeight` NaN — pass sensitivity from triage, guard against undefined
  - **Ladder rung**: 6 (one-liner — add default)
  - **Test first**: `test('calibrateWeight handles undefined sensitivity', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [ ] 1.2 Fix `session-do` check filtering — map check IDs to OracleKind
  - **Ladder rung**: 2 (reuse — use existing CHECK_GATE_MAP from plan.ts)
  - **Test first**: `test('session-do maps check IDs correctly', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [ ] 1.3 Fix `session-archive` double recording — remove duplicate measureRecord
  - **Ladder rung**: 6 (one-liner — delete lines)
  - **Test first**: `test('session-archive does not record duplicate', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [ ] 1.4 Create `.github/workflows/ci.yml`
  - **Ladder rung**: 2 (reuse — standard CI template)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

## 2. Code Quality

- [ ] 1.5 Fix `formatInvocation` — `ww` → `veridia`
  - **Ladder rung**: 6 (one-liner — string replace)
  - **Test first**: `test('formatInvocation uses veridia prefix', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/agent.test.ts`

- [ ] 1.6 Remove dead `computeSensitivity` import from triage.ts
  - **Ladder rung**: 6 (one-liner — delete import)
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [ ] 1.7 Deduplicate `isTestsWeak` — export from weight.ts, import in probe.ts
  - **Ladder rung**: 2 (reuse — function exists, just import)
  - **Test first**: `test('probe uses isTestsWeak from weight', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

## 3. Documentation Sync

- [ ] 1.8 Fix `docs/mechanics.md` — pipeline diagram, skill table, runtime paths
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.9 Fix `docs/verifiability.md` — decision tree, level 0
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.10 Fix `docs/protocol/learn-result.md` — add oraclePrecision
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.11 Fix `docs/protocol/verification-report.md` — add test-content
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.12 Fix `AGENTS.md` — add Stage 8, fix commandment 4
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [ ] 1.13 Fix `README.md` — output example
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
