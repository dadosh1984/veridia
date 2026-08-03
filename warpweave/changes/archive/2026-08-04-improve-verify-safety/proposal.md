## Why

`verify` runs real commands via `execFileSync` with 120s timeout. If `vitest` is not installed, it crashes. `CHECK_GATE_MAP` is hardcoded to `vitest run` / `tsc --noEmit` — only works for JS/TS projects. No `--dry-run` mode to preview what would run.

## What Changes

- Add `--dry-run` flag to `verify` command — prints commands without running them
- Detect test-runner from `package.json` scripts instead of hardcoded map
- Graceful fallback when command is not found (exit code 0, warning in stderr)
- No breaking changes

## Capabilities

### New Capabilities
- (none — improvement to existing verify)

### Modified Capabilities
- `verify`: REQUIREMENT changed — now supports `--dry-run` and auto-detects test runner

## Impact

- `src/verify/verify.ts` — add `dryRun` option, detect runner from package.json
- `src/verify/resolve.ts` — read test script from package.json
- `src/execute/plan.ts` — `CHECK_GATE_MAP` reads from config/project
- `src/cli/index.ts` — add `--dry-run` flag to verify command

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — crashes on non-JS projects |
| Existing code reuse? | **Yes** — `resolveCommands` already reads package.json |
| Stdlib? | **Yes** — `fs.existsSync`, `JSON.parse` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
