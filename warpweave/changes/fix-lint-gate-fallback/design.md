## Context

See `proposal.md`. In shell mode, `delegateShell` runs plan gates; a `human-review` lint gate wrongly falls back to `vitest run`, failing in projects without tests.

## Decisions

### 1. Scope the `'vitest run'` fallback to `test-runner` gates
In `buildExecutionPlan`, `fallback = gate.kind === 'test-runner' ? 'vitest run' : ''`. A `lint`/`human-review` gate with no resolved command gets `''`, which `delegateShell` already skips (`if (!gate.command) continue`).

### 2. Keep `test-runner` behavior unchanged
A `run-tests` gate with no resolved script still falls back to `vitest run` (testing a project with a test-runner oracle).

## Tasks

- [ ] 1.1 Scope the `vitest run` fallback to `test-runner` gates in `src/execute/plan.ts`
  - **Ladder rung**: 1 (YAGNI — one-line fallback change)
  - **Test first**: `test('lint gate has empty command; test gate falls back to vitest run', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`
