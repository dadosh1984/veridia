## Why

The `assess` command currently only checks for the existence of test config files and package.json scripts. It does not verify that test files contain actual assertions (`expect`, `assert`, `it`, `test`). A project with `vitest.config.ts` and an empty test file gets level 3 (full verifiability), which is "verifiability theater" — the very thing veridia claims to fight. The external audit also flagged this as a key weakness.

## What Changes

- **Add content analysis to assess probe**: When a test-runner oracle is detected, scan test files for assertion tokens (`expect`, `assert`, `it`, `test`). If no assertions found, downgrade the oracle weight or mark it as weak
- **Add test-content oracle kind**: New oracle kind `test-content` that reflects whether tests have actual assertions
- **Update map-level.ts**: Use test-content oracle to influence level — if test-runner exists but test-content is weak, cap at level 2 instead of 3
- **Reuse isTestsWeak from weight.ts**: The function already exists in `src/verify/weight.ts` — wire it into assess

## Capabilities

### Modified Capabilities
- `assess`: Add content analysis of test files; new `test-content` oracle; cap level when tests are empty

## Impact

| Area | Impact |
|------|--------|
| `src/assess/probe.ts` | Add test file content scanning, return `test-content` oracle |
| `src/assess/map-level.ts` | Use `test-content` oracle to cap level at 2 when tests are weak |
| `src/assess/types.ts` | Add `test-content` to `OracleKind` |
| `src/verify/weight.ts` | Export `isTestsWeak` for reuse in assess |
| `test/assess.test.ts` | New tests for content analysis |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — empty tests giving level 3 is verifiability theater |
| Existing code reuse? | **Yes** — `isTestsWeak()` already exists in `weight.ts` |
| Stdlib? | **Yes** — regex-based content scan, no parser needed |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
