## Why

CI is red: in pure shell delegation mode (no agent env, e.g. Actions runner), `delegateShell` executes plan gates, and a `human-review`/lint gate gets a fallback command of `vitest run` (`src/execute/plan.ts`). `vitest run` in a project with no tests exits 1, so `triage`'s `executionResult.exitCode` becomes 1 and the test suite fails. Locally it was masked because tests ran under opencode (file mode). `human-review` is a human/lint gate and must not auto-run `vitest run`.

## What Changes

- In `src/execute/plan.ts`, apply the `'vitest run'` fallback **only** for `test-runner` gates; a `lint`/`human-review` gate with no resolved command gets an empty command (delegateShell skips empty commands).
- Add a regression test.

## Capabilities

### New Capabilities
- none (tooling/bugfix — `skip_specs: true`)

## Impact

| Area | Impact |
|------|--------|
| `src/execute/plan.ts` | Gate fallback scoped to `test-runner` |
| `test/execute.test.ts` | Regression: lint gate gets empty command, not `vitest run` |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — CI is red; lint gate wrongly runs tests |
| Existing code reuse? | **Yes** — delegateShell already skips empty gate commands |
| New dependency? | **No** |

## Complexity

Complexity: **normal** (bugfix + regression test)
