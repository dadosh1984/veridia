## Why

`delegateStdout()` writes the execution plan to stdout. `triage()` then writes its JSON result to stdout. The result is two JSON objects in one stream — the CLI output is invalid JSON. 2 tests in `cli.test.ts` fail because of this.

## What Changes

- `delegateStdout()` writes plan to stderr instead of stdout
- `triage()` no longer double-outputs the plan
- All existing callers continue to work unchanged

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — pure bugfix, no spec-level behavior change)

## Impact

- `src/execute/delegate.ts` — change `process.stdout.write` to `process.stderr.write` in `delegateStdout`
- `src/triage/triage.ts` — ensure `executionResult.stdout` is captured, not re-emitted
- `test/cli.test.ts` — 2 tests should pass after fix

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — 2 tests fail, JSON output is broken |
| Existing code reuse? | **Yes** — `process.stderr.write` is stdlib |
| Stdlib? | **Yes** — `process.stderr` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
