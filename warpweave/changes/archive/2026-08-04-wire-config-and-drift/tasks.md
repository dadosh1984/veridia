## 1. Wire Config into Classify

- [x] 1.1 Add optional `config` parameter to `classify()` function
  - **Spec scenario**: Classify with user-configured patterns
  - **Ladder rung**: 2 (Reuse — `loadConfig()` already exists)
  - **Test first**: `test('classify uses config patterns when provided', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/classify.test.ts`

- [x] 1.2 Load config in `triage()` and pass to `classify()`
  - **Spec scenario**: triage uses user-configured patterns
  - **Ladder rung**: 2 (Reuse — `loadConfig()` already exists)
  - **Test first**: `test('triage passes config to classify', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

## 2. Implement Drift Calculation

- [x] 2.1 Implement drift calculation in `triage()`
  - **Spec scenario**: drift is calculated from history
  - **Ladder rung**: 7 (Minimum — simple heuristic, no new module)
  - **Test first**: `test('drift is non-zero when verdict diverges from history', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 2.2 Pass calculated drift to `measureRecord()`
  - **Spec scenario**: drift is zero on first run
  - **Ladder rung**: 2 (Reuse — `measureRecord` already accepts drift)
  - **Test first**: `test('drift is 0 on first run', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`
