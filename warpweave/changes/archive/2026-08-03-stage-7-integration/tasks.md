## 1. Triage Orchestrator

- [x] 1.1 Create `src/triage/triage.ts` with `triage()` function that chains classify → assess → route → ask → verify → measure
  - **Spec scenario**: triage runs the full loop
  - **Ladder rung**: 2 (reuse — chains existing modules)
  - **Test first**: `test('triage runs full loop and returns summary', () => { ... })`
  - **Verify**: `rtk vitest test/triage.test.ts`

## 2. CLI Integration

- [x] 2.1 Modify `src/cli/index.ts` to fallthrough unknown non-flag args to triage module
  - **Spec scenario**: end-to-end triage with task string
  - **Ladder rung**: 2 (reuse — repurposes existing `else` branch)
  - **Test first**: `test('veridia "add dark mode" runs triage', () => { ... })`
  - **Verify**: `rtk vitest test/cli.test.ts`

## 3. Tests

- [x] 3.1 Create `test/triage.test.ts` with tests for triage orchestrator
  - **Spec scenario**: all triage spec scenarios
  - **Ladder rung**: 2 (reuse — same vitest + helpers pattern)
  - **Test first**: N/A (this IS the test file)
  - **Verify**: `rtk vitest test/triage.test.ts`

- [x] 3.2 Add end-to-end triage scenarios to `test/cli.test.ts`
  - **Spec scenario**: end-to-end triage with task string
  - **Ladder rung**: 2 (reuse — same CLI test pattern)
  - **Test first**: N/A (adding to existing test file)
  - **Verify**: `rtk vitest test/cli.test.ts`

## 4. Documentation

- [x] 4.1 Update `README.md` with current status, architecture overview, and usage examples
  - **Spec scenario**: N/A (documentation)
  - **Ladder rung**: 2 (reuse — edits existing file)
  - **Test first**: N/A
  - **Verify**: `rtk vitest test/cli.test.ts`
