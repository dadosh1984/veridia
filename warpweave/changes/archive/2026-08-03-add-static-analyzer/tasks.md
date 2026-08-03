## 1. Static Analyzer Module

- [x] 1.1 Create `src/analyze/types.ts` with `Finding`, `Severity`, and `AnalyzeResult` types
  - **Ladder rung**: 3 (stdlib — plain TypeScript types)
  - **Verify**: `vitest test/analyze.test.ts`

- [x] 1.2 Create `src/analyze/checks.ts` with checker functions: secrets, try/catch, dangerous patterns, console.log, TODO
  - **Ladder rung**: 3 (stdlib — `readFileSync` + regex)
  - **Verify**: `vitest test/analyze.test.ts`

- [x] 1.3 Create `src/analyze/analyze.ts` with `runAnalysis()` orchestrator
  - **Ladder rung**: 2 (reuse — same pattern as `review.ts`)
  - **Verify**: `vitest test/analyze.test.ts`

## 2. Review Integration

- [x] 2.1 Update `src/review/review.ts` to run static analysis and include findings in output
  - **Ladder rung**: 2 (reuse — extends existing `buildReviewInstructions`)
  - **Verify**: `vitest test/review.test.ts`

## 3. Tests

- [x] 3.1 Create `test/analyze.test.ts` with tests for all checkers
  - **Ladder rung**: 2 (reuse — same vitest pattern)
  - **Verify**: `vitest test/analyze.test.ts`
