## Why

`readHistory` (`src/measure/history.ts:49-55`) swallows `JSON.parse` failures with an empty `catch {}` — no log, no count, nothing. The whole point of the measure/learn feature is calibrating on accumulated history ("an instrument that measures its own misses so it doesn't guess blindly"), yet the subsystem itself loses data invisibly when a line in `history.jsonl` is corrupt. Separately, the archived change `2026-08-03-fix-audit-issues` claims task 2.1 "use readline streaming instead of readFileSync + split" as done `[x]` — but the code still does `readFileSync(...).trim().split('\n')` (`history.ts:46`). The archived change is not actually in the tree: drift.

## What Changes

- `readHistory` streams line-by-line via `node:readline` instead of loading the whole file and splitting (the archived change's intent, actually applied now)
- Per-line `JSON.parse` failures are counted and reported: a warning to stderr naming the skipped line count (or line numbers) instead of silent `catch {}`
- Corrupt lines are still skipped (data continues to be usable) — but the loss is now visible to the user
- Update the archived change's status or note the drift resolution so warpweave and code agree

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `measure`: the history-reading requirement now surfaces skipped/corrupt lines to the user instead of silently dropping them

## Impact

- `src/measure/history.ts` — `readHistory` uses `readline`, tracks and reports parse failures
- `src/measure/learn.ts` — callers of `readHistory` unchanged (they already receive valid entries)
- `test/measure.test.ts`, `test/learn.test.ts` — tests for corrupt-line reporting and streaming
- `warpweave/changes/archive/2026-08-03-fix-audit-issues/tasks.md` — mark 2.1 actually done (or reference this change)

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — silent data loss defeats the feature's purpose; documented drift exists |
| Existing code reuse? | **Yes** — `node:readline` is the stdlib streaming API the archived change already chose |
| Stdlib? | **Yes** — `readline.createInterface`, `process.stderr.write` |
| Native platform? | **No** |
| New dependency? | **No** — explicitly rejects pino: a `process.stderr.write` warning is enough for a JSONL reader |

## Complexity

Complexity: **normal**
