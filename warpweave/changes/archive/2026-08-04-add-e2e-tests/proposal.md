## Why

All 216 tests are unit tests with fake FS. No test verifies that the CLI works end-to-end — from `process.argv` to JSON output. The 2 failing tests in `cli.test.ts` were only caught because they parse JSON output.

## What Changes

- Add 3 e2e tests that run `veridia classify`, `veridia assess`, and `veridia <task>` through the real `dist/cli/index.js`
- Tests verify valid JSON output and correct exit codes
- Tests use temp directories (same pattern as existing tests)

## Capabilities

### New Capabilities
- (none — testing infrastructure)

### Modified Capabilities
- (none — no behavior change)

## Impact

- `test/e2e.test.ts` — new file with 3 e2e tests
- No changes to source code

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — 2 tests already failed from output issues |
| Existing code reuse? | **Yes** — `runCli` helper already exists |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
