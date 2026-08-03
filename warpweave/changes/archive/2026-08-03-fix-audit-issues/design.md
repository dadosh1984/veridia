## Context

See proposal.md — Why. Security audit found 8 issues across 6 files. All fixes are self-contained within their modules. No new behavior or APIs.

## Goals / Non-Goals

**Goals:**
- Fix Command Injection in `run.ts` by removing `shell: true`
- Add OOM-safe streaming in `readHistory`
- Add try/catch per line in JSONL parsing
- Add `FsLike` DI seam to `resolve.ts`
- Add shared `parseFlags` helper to reduce CLI duplication
- Add `__tests__/`/`test/`/`tests/` directory detection in `weight.ts`
- Merge duplicate conditions in `select.ts`
- Handle `signal` property in error typing

**Non-Goals:**
- No new features or behavior changes
- No new dependencies
- No changes to the CLI's external interface

## Decisions

1. **`execFileSync` without `shell: true`** — Instead of passing a command string, split the command into args array. `execFileSync` with an args array never invokes a shell, eliminating injection. The command from `package.json` scripts is already split by npm/pnpm — we use the same split logic.

2. **`readline` streaming over `readFileSync` + `split`** — `node:readline` reads line-by-line without loading the entire file into memory. Each line is parsed independently with try/catch; corrupted lines are skipped.

3. **`parseFlags` helper over citty/commander** — A 30-line shared helper that takes a flag spec and returns a parsed map. Reuses the existing pattern without adding a dependency. The ponytail ladder says: reuse (rung 2) before dependency (rung 5).

4. **`FsLike` seam in `resolve.ts`** — Same pattern as `probe.ts`. `readScript` accepts an optional `FsLike` parameter defaulting to `realFs`. Enables isolated unit testing.

5. **Directory-based test detection** — Add `test/`, `tests/`, `__tests__/` to `collectTestFiles` alongside the existing file pattern. Simple `path.basename(dir)` check.

## Risks / Trade-offs

- [Risk] Removing `shell: true` may break commands that use shell features (pipes, env vars, `&&`) → Mitigation: npm/pnpm scripts rarely need shell features; if a script uses `&&`, the user should use `npm run test` instead of the raw command
- [Risk] `readline` streaming is slightly slower for small files → Mitigation: negligible for <1000 lines; for large files it's strictly better

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| run.ts security fix | 3 (Stdlib) | `execFileSync` with args array — no shell |
| history.ts streaming | 3 (Stdlib) | `node:readline` — built-in |
| CLI parseFlags helper | 2 (Reuse) | Shared helper, same pattern as existing |
| resolve.ts DI seam | 2 (Reuse) | Same `FsLike` pattern as `probe.ts` |
| weight.ts test detection | 2 (Reuse) | Same `collectTestFiles` with added dirs |
| select.ts merge | 6 (One-liner) | Single condition merge |
