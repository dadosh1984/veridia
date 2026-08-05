## Why

`veridia fix` silently corrupts user code. `src/analyze/fix.ts` removes "console.log" lines with a per-line regex (`fix.ts:13,19-27`) that also matches the contents of multiline template literals — so a string like `` `...console.log(result)...` `` gets destroyed at runtime. The command has no `--dry-run` (unlike `verify`), no backup, and writes with a direct `writeFileSync` (`fix.ts:85`). For a tool sold as a "quality gate for AI agents", silent corruption of user code is a reputation risk.

## What Changes

- Add `--dry-run` flag to `veridia fix` (reuse the `dryRun` pattern already in `verify`) — prints what would change without writing
- Add a git-dirty guard: refuse to write files when the target repo has uncommitted changes, unless `--force` is passed
- Replace the line-regex removal with AST-based removal using the TypeScript compiler API (already in the repo), so `console.log`/`TODO` are removed as code nodes, never as string content
- Backfill tests for template-literal false positives, multiline `console.log` (current regex misses it — `.*` does not cross lines), and dry-run/git-guard behavior

## Capabilities

### New Capabilities
- `auto-fix`: Safe automatic fixing — `veridia fix` removes console-log and TODO markers as code nodes (never string content), supports preview (dry-run), and refuses to modify uncommitted trees without an explicit override

### Modified Capabilities
- (none — no existing `fix` spec; analyze/fix behavior is currently unspecced)

## Impact

- `src/analyze/fix.ts` — dryRun option, git-dirty guard, AST-based `fixConsoleLog`/`fixTodo`
- `src/cli/commands/fix.ts` — `--dry-run` and `--force` options
- `package.json` — `typescript` moves from devDependencies to dependencies (needed at runtime for AST); tsup externalizes it
- `test/analyze.test.ts`, `test/fix*.test.ts` — new regression tests
- Docs (`docs/usage.md`) — document `--dry-run` / `--force`

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — silent corruption of user code is a P0 defect |
| Existing code reuse? | **Yes** — `dryRun` option pattern already in `src/verify/verify.ts`; `splitCommand`/`execFileWithShim` for the git check |
| Stdlib? | **Yes** — `child_process.execFileSync('git', ['status', '--porcelain'])` for the dirty guard |
| Native platform? | **No** |
| New dependency? | **No new package** — the TypeScript compiler API is already installed; it just moves from devDependencies to runtime dependencies. (Alternative ts-morph rejected — extra dependency on top of typescript.) |

## Complexity

Complexity: **normal**
