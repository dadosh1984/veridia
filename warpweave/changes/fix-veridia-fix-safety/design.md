# Design: fix-veridia-fix-safety

## Context

See proposal.md — Why. Current `autoFix` in `src/analyze/fix.ts` splits file content into lines and filters them with two regexes:
- `CONSOLE_LOG = /\bconsole\.(log|debug|info)\s*\(.*\)\s*;?\s*$/` (`fix.ts:13`)
- `TODO_PATTERN = /^\s*\/\/\s*(TODO|FIXME|HACK|XXX)\b/` (`fix.ts:14`)

Both are line-based and text-blind: they match string/template content and miss multiline calls. `writeFileSync` at `fix.ts:85` applies changes with no preview and no backup.

## Goals / Non-Goals

**Goals:**
- No user file is ever modified without a preview or a safety check
- Console-log / TODO removal is AST-based: nodes of code, not lines of text
- Reuse the existing `dryRun` option pattern from `src/verify/verify.ts:12`

**Non-Goals:**
- Not adding new analysis patterns (scope stays console-log + TODO)
- Not a full lint/auto-fix framework — one command, two patterns
- Not touching `analyze` detection itself (it has the same template-literal weakness, but detection is read-only and non-destructive; fixing it is tracked separately)

## Decisions

### Decision 1: AST-based removal via the TypeScript compiler API

Use `typescript` (already in devDependencies) at runtime: parse each file with `ts.createSourceFile`, walk the AST, collect `console.*` call expression statements and comment ranges matching TODO patterns, then rebuild the text from the source text with the removed spans sliced out.

Alternatives considered:
- **ts-morph** (dependency on top of typescript) — rejected: the plain compiler API is enough for two removal patterns; adding ts-morph is an extra rung-5 dependency for the same result.
- **Smarter regex** — rejected: line-based regex cannot reliably distinguish string content from code; the whole defect class is regex's inability to know context.

### Decision 2: dry-run reuse

Add `dryRun?: boolean` to `autoFix(target, opts)` mirroring `verify()`'s option. In dry-run mode, compute the new content but never `writeFileSync`; still return `{ fixed, skipped, errors, details }` so `fix.ts` command output is identical, only with a "would fix" marker.

### Decision 3: git-dirty guard

Before writing, run `execFileSync('git', ['status', '--porcelain'], { cwd: target })`. If output is non-empty and not `--force`, abort with non-zero exit and a stderr message. Non-git dirs (git command errors) are treated as "not blocked". Dry-run skips the guard entirely. Reuses `execFileWithShim` for the git invocation to keep the Windows `git.exe` resolution working.

## Risks / Trade-offs

- [typescript becomes a runtime dependency, growing install size] → Mitigation: tsup already bundles the entry; typescript is a single large dep, acceptable for a CLI whose whole point is JS/TS project analysis. Mark in package.json as regular `dependency`.
- [AST slicing by span can produce odd whitespace] → Mitigation: slice the source text between spans; remove the full statement text including trailing newline where the statement owns it; verify with `ts.createSourceFile` reparse that the result still parses, else keep the original (fail safe).
- [Multi-line string scenarios in template literals] → Mitigation: only touch spans that correspond to actual `ExpressionStatement`/`Comment` nodes, which the parser already resolves.

## Migration Plan

Single change; rollback is a revert. No data migration.

## Open Questions

None — the AST approach, dry-run, and git guard are sufficient; remaining unknowns (which exact console-call shapes to cover, e.g. `console.log` chained off other expressions) are implementation details settled during TDD.
