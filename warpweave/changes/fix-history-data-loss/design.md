# Design: fix-history-data-loss

## Context

See proposal.md — Why. `readHistory` (`src/measure/history.ts:42-57`) does `readFileSync(file, 'utf8').trim().split('\n')` then `JSON.parse` each line inside `try { ... } catch {}`. The empty catch is the silent-loss defect; the read-then-split is the drift (archived change `2026-08-03-fix-audit-issues` task 2.1 promised `readline` streaming but it was never applied). The per-line try/catch already exists — what's missing is the *reporting* and the *streaming*.

## Goals / Non-Goals

**Goals:**
- Read `history.jsonl` via `node:readline` (line-by-line, no full-file buffering/split)
- Count and report corrupt lines to stderr
- Keep returning only valid entries to all existing callers (`learn.ts`, `mcp/index.ts`, CLI measure)

**Non-Goals:**
- Not changing the append path (`appendEntry` is already correct and append-only)
- Not adding a logging framework (pino rejected — a stderr warning suffices)
- Not auto-repairing or rewriting the history file (append-only by spec)

## Decisions

### Decision 1: readline streaming (async)

Switch `readHistory` to `readline.createInterface({ input: createReadStream(file), crlfDelay: Infinity })` consumed with `for await...of`. This streams rather than buffering the whole file and handles both LF and CRLF (Windows is first-class per AGENTS.md) — matching the archived change's stated "OOM-safe streaming" intent. `readHistory` becomes `async` and returns `Promise<MeasureEntry[]>`.

Call-site impact (all located): `src/measure/learn.ts` (`computePrecision(historyEntries)` callers), `src/mcp/index.ts:113`, and the CLI `measure --history` command — each already awaits other async work or sits in an async handler, so the churn is a single `await` each.

### Decision 2: count-and-warn, keep skipping

Track `skipped` for lines where `JSON.parse` throws; ignore empty/whitespace-only lines silently (preserving existing blank-line behavior). After the read, if `skipped > 0`, write one warning to stderr: `veridia: warning: skipped <n> corrupt line(s) in .veridia/history.jsonl`. Corrupt lines stay skipped — tolerant accumulation is the feature's philosophy — but the loss is now visible.

Alternatives considered:
- **Abort or throw on first corrupt line** — rejected: one bad line must not discard the whole history.
- **Only count, never report** (status quo) — rejected: that is the defect.

### Decision 3: report through the CLI, keep the readHistory signature

Keep `readHistory`'s return as `MeasureEntry[]` (non-breaking for `learn.ts` and MCP). Add a small CLI-level wrapper in `src/cli/commands/measure.ts` that reads the raw lines, runs the parse, and prints the skip warning to stderr before printing the summary. The warning logic lives in one place: a `parseHistoryLines(content): { entries, skipped }` helper exported from `src/measure/history.ts`, used by `readHistory` (streaming, ignores the count for its return) and by the CLI (reports the count).

## Risks / Trade-offs

- [Async readHistory touches 3 call sites] → Mitigation: enumerated above; all are async-capable today. Test suite (`measure.test.ts`, `learn.test.ts`) updated with `await readHistory(...)`.
- [Huge history file warning flood] → Mitigation: single aggregate warning line, not one per corrupt line.
- [Behavioral drift risk again] → Mitigation: this change updates the archived change's task 2.1 to reference itself as the actual implementation, closing the warpweave/code gap.

## Migration Plan

Single change. Rollback = revert (call sites return to sync reads). The archive note for `2026-08-03-fix-audit-issues` task 2.1 is updated to point at this change.

## Open Questions

None. The async conversion, the wrapper, and the reporting are all decided; remaining detail (exact warning wording) is cosmetic.
