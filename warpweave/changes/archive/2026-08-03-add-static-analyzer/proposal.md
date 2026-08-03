## Why

veridia's `review` subcommand currently only outputs a list of files and patterns for an AI agent — it does not perform any actual code analysis. Users expect `veridia review --target .` to find real bugs, security issues, and code quality problems without needing an external AI agent. A built-in static analyzer can catch common issues (hardcoded secrets, missing try/catch, dangerous patterns) using pure regex and AST-free scanning — no dependencies, no AI.

## What Changes

- New `analyze` subcommand: runs static analysis on source files and reports findings with severity, file, line, and description
- New `src/analyze/` module with pluggable checkers (secrets, injection, error handling, type safety, duplication)
- `veridia review --target .` now runs the static analyzer AND outputs agent instructions (combined output)
- Zero new runtime dependencies — all checks are regex/pattern-based

## Capabilities

No new capabilities — pure tooling improvement. No spec-level behavior changes.

## Impact

- New files: `src/analyze/analyze.ts`, `src/analyze/checks.ts`, `src/analyze/types.ts`
- Modified: `src/cli/index.ts` — `review` branch now runs analyzer + outputs agent instructions
- Modified: `src/review/review.ts` — add `buildCombinedReview()` that merges analysis + agent instructions
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without analysis, review is just a file list |
| Existing code reuse? | **Yes** — `collectSourceFiles` from review.ts reused |
| Stdlib? | **Yes** — all checks use `node:fs` and regex |
| Native platform? | **Yes** — Node.js 22+ |
| New dependency? | **No** — zero new dependencies |

## Complexity

Complexity: **normal** — new component (analyze module), modified review and CLI
