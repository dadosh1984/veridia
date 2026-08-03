## Why

Security audit revealed a critical Command Injection vulnerability in `src/verify/run.ts` (shell:true + untrusted command). Additional issues: OOM risk in history reader, fragile JSONL parsing, missing DI seam in resolve.ts, duplicated CLI arg parsing, incomplete test file detection, and redundant logic in selectQuestions. These must be fixed before the project is safe to use on untrusted repositories.

## What Changes

- **CRITICAL FIX**: Remove `shell: true` from `execFileSync` in `run.ts` — use `execFileSync` with explicit args array instead of a command string
- **OOM FIX**: Add line-by-line streaming in `readHistory` instead of loading entire file
- **JSONL FIX**: Add try/catch per line in `readHistory` to skip corrupted entries
- **DI FIX**: Add `FsLike` injectable seam to `resolve.ts` (same pattern as `probe.ts`)
- **CLI FIX**: Replace 6 duplicated arg-parsing loops with a shared `parseFlags` helper
- **TEST DETECTION FIX**: Add `__tests__/`, `test/`, `tests/` directory detection to `weight.ts`
- **SELECT FIX**: Merge duplicate `EXPECTED_OUTCOME_QUESTION` conditions in `select.ts`
- **ERROR TYPING FIX**: Handle `signal` property in `run.ts` error handling
- **READDIR FIX**: Add try/catch to `collectTestFiles` in `weight.ts`

## Capabilities

No new capabilities — pure refactor and bugfix. No spec-level behavior changes.

## Impact

- Modified: `src/verify/run.ts`, `src/verify/resolve.ts`, `src/verify/weight.ts`
- Modified: `src/ask/select.ts`
- Modified: `src/measure/history.ts`
- Modified: `src/cli/index.ts`
- Modified: `test/verify.test.ts` (add DI tests for resolve)
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — Command Injection is a critical security vulnerability |
| Existing code reuse? | **Yes** — `FsLike` pattern from `probe.ts` reused in `resolve.ts` |
| Stdlib? | **Yes** — all fixes use only `node:fs`, `node:child_process`, `node:readline` |
| Native platform? | **Yes** — Node.js 22+ `readline` API for streaming |
| New dependency? | **No** — zero new dependencies |

## Complexity

Complexity: **normal** — touches 6 files, multiple modules, security-critical changes
