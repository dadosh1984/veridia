## Why

An external audit of veridia surfaced two low-risk but real defects that undermine debugging and robustness under redirected I/O:

1. **Verify swallows the reason a check failed.** `runCommand` (`src/verify/run.ts`) returns only an `exitCode`; the child's captured stdout/stderr are discarded, and `verify()` reduces any throw to `exitCode = 1`. When `npm test` dies from EACCES, OOM, or a lint error, the user sees only "check failed" with no cause.
2. **The interactive ask loop is fragile under redirection.** `promptQuestion` (`src/ask/prompt.ts`) creates and closes a fresh `readline` interface for every question, which is wasteful and can misbehave when stdin/stdout are piped (CI, non-TTY).

The audit's larger async-FS concern (blocking tree walk in `collectTestFiles`) is real but architectural — it conflicts with `verify()`'s synchronous design. It is deferred to a separate spike, not folded into this small hardening change.

## What Changes

- **Surface the failure cause on a check.** Stream the child's stderr (and optionally exit code) back into the report so a failed oracle says *why*.
- **Reuse a single `readline` interface** across all questions in one ask run, closing it once at the end.

Both are additive and change no verdict semantics (`PASS`/`FAIL`/`HUMAN` decision logic stays untouched).

## Capabilities

### Modified Capabilities
- `verify`: report includes the failure reason/error text for a failed check.
- `ask`: the interactive prompt owns one `readline` interface per command invocation instead of one per question.

## Impact

| Area | Impact |
|------|--------|
| `src/verify/run.ts` | Return captured stderr/error text (and exit code) on `RunResult` |
| `src/verify/types.ts` | `Check` gains an optional `error?: string` (additive, protocol `/v1` kept) |
| `src/verify/verify.ts` | Propagate failure reason into `Check.error`; keep `catch` mapping |
| `src/ask/prompt.ts` | Hoist `createInterface` to one instance; close once |
| `test/verify.test.ts` | New: failed check carries its stderr/error text |
| `test/ask.test.ts` | New: multiple questions reuse one interface (no per-question close) |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — "why did it fail" is core debugging value |
| Existing code reuse? | **Yes** — extend existing `RunResult`/`Check`/`promptQuestions` |
| Stdlib? | **Yes** — `node:readline` already used; capture via existing `execFileSync` |
| Native platform? | **No** |
| New dependency? | **No** |
| Fold async-FS into this change? | **No** — architectural, deferred to separate spike |

## Complexity

Complexity: **small**
