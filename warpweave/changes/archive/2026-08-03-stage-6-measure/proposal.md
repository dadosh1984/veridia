## Why

Veridia's triage loop (assess → route → ask? → do → verify → measure) is missing the last step: **measure**. Without recording drift, token/cost, and outcomes per run, we cannot answer "did we overpay, misjudge, or improve?" — the self-correction loop is broken.

## What Changes

- New `measure` subcommand: records a run's outcome (task, type, level, verdict, checks, drift note) into a local JSON-line history file
- New `measure` module in `src/measure/` with types, recording, and history querying
- CLI integration: `veridia measure` subcommand with `--record` and `--history` modes
- A local history file at `.veridia/history.jsonl` (gitignored, per-project)
- No external model calls — purely local file I/O

## Capabilities

### New Capabilities
- `measure`: Record run outcomes (task, type, level, verdict, checks, drift) into a local JSON-line history and surface trends from accumulated history

### Modified Capabilities

- `cli`: Add `measure` subcommand to the CLI dispatcher
- `verify`: No spec-level changes — the verify module already returns a `VerifyResult` that measure can consume

## Impact

- New files: `src/measure/types.ts`, `src/measure/measure.ts`, `src/measure/history.ts`
- Modified: `src/cli/index.ts` (add `measure` branch)
- New test file: `test/measure.test.ts`
- New gitignore entry: `.veridia/` (for history data)
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — the roadmap requires measure before Stage 7; without it the loop is incomplete |
| Existing code reuse? | **No** — no existing recording/history module in the codebase |
| Stdlib? | **Yes** — `node:fs` append + read, `JSON.stringify`/`JSON.parse` for JSONL |
| Native platform? | **Yes** — Node.js 22+ file system handles this natively |
| New dependency? | **No** — zero new dependencies needed |

## Complexity

Complexity: **normal** — new component (4+ files), new public subcommand, new behavior
