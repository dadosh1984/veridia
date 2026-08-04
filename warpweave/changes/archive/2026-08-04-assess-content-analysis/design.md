## Context

See `proposal.md`. The `assess` module currently only checks for existence of test config files. It doesn't verify test content. This is "verifiability theater" — a project with `vitest.config.ts` and empty test files gets level 3.

## Decisions

### 1. Reuse isTestsWeak from weight.ts
The function already exists in `src/verify/weight.ts`. Export it and call it from `probe.ts` when a test-runner oracle is detected.

### 2. New oracle kind: test-content
Add `test-content` to `OracleKind`. When test-runner is detected, probe also checks test file content. If tests are weak (no assertions), emit `test-content` oracle with `present: false`.

### 3. Cap level when tests are weak
In `map-level.ts`, if test-runner exists but test-content is weak, cap at level 2 instead of 3.

## Tasks

- [x] 1.1 Add `test-content` to `OracleKind` in `src/assess/types.ts`
- [x] 1.2 Export `isTestsWeak` from `src/verify/weight.ts`
- [x] 1.3 Wire test-content probe into `src/assess/probe.ts`
- [x] 1.4 Cap level in `src/assess/map-level.ts` when tests are weak
- [x] 1.5 Update `warpweave/specs/assess/spec.md` with new test-content oracle
