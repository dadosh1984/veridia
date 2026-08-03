## 1. Types and History Module

- [x] 1.1 Create `src/measure/types.ts` with `MeasureEntry` and `HistorySummary` types
  - **Spec scenario**: measure subcommand records a run outcome
  - **Ladder rung**: 3 (stdlib — plain TypeScript types, no dependencies)
  - **Test first**: `test('MeasureEntry has required fields', () => { ... })`
  - **Verify**: `rtk vitest test/measure.test.ts`

- [x] 1.2 Create `src/measure/history.ts` with `appendEntry()` and `readHistory()` functions
  - **Spec scenario**: history file is append-only and local
  - **Ladder rung**: 3 (stdlib — `node:fs` appendFileSync + readFileSync)
  - **Test first**: `test('appendEntry writes JSONL line', () => { ... })`
  - **Verify**: `rtk vitest test/measure.test.ts`

## 2. Measure Orchestrator

- [x] 2.1 Create `src/measure/measure.ts` with `measure()` orchestrator function
  - **Spec scenario**: measure subcommand records a run outcome
  - **Ladder rung**: 2 (reuse — same pattern as `src/verify/verify.ts`)
  - **Test first**: `test('measure records and returns summary', () => { ... })`
  - **Verify**: `rtk vitest test/measure.test.ts`

## 3. CLI Integration

- [x] 3.1 Add `measure` branch to `src/cli/index.ts` dispatcher
  - **Spec scenario**: measure subcommand dispatched
  - **Ladder rung**: 2 (reuse — same flat `if/else if` pattern as existing branches)
  - **Test first**: `test('veridia measure --history prints summary', () => { ... })`
  - **Verify**: `rtk vitest test/cli.test.ts`

## 4. Tests

- [x] 4.1 Create `test/measure.test.ts` with tests for all measure scenarios
  - **Spec scenario**: all measure spec scenarios
  - **Ladder rung**: 2 (reuse — same vitest + helpers pattern as existing tests)
  - **Test first**: N/A (this IS the test file)
  - **Verify**: `rtk vitest test/measure.test.ts`

- [x] 4.2 Add measure scenarios to `test/cli.test.ts`
  - **Spec scenario**: measure subcommand dispatched
  - **Ladder rung**: 2 (reuse — same CLI test pattern)
  - **Test first**: N/A (adding to existing test file)
  - **Verify**: `rtk vitest test/cli.test.ts`
