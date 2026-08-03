## Why

Two real problems identified in the audit: (1) `loadConfig()` exists but is never called — user-configured patterns in `.veridia/config.json` are silently ignored by `classify()`. (2) `drift` in `measureRecord` is always an empty string — the system claims to "learn from its own misses" but never calculates drift.

Both are small, isolated fixes that close the gap between the architecture and the actual behavior.

## What Changes

- **Modified `classify()`**: Accept an optional `config` parameter. When provided, use patterns from config instead of hardcoded `RULES`. Backward compatible — no config = old behavior.
- **Modified `triage()`**: Load config via `loadConfig()` and pass it to `classify()`. Calculate drift from history and pass it to `measureRecord()`.
- **New drift calculation**: Simple heuristic — compare current verdict against recent history success rate. Non-zero drift when a task fails despite high historical pass rate.
- **No breaking changes**: All existing callers continue to work unchanged.

## Capabilities

### New Capabilities
- (none — pure refactoring of existing internals)

### Modified Capabilities
- `classify`: REQUIREMENT changed — now accepts optional config for user-defined patterns
- `triage`: REQUIREMENT changed — now loads config and calculates drift

## Impact

- `src/classify/classify.ts` — add optional `config` parameter
- `src/triage/triage.ts` — load config, calculate drift
- `src/cli/index.ts` — pass config to triage (already imports `loadConfig`)
- `src/measure/` — new `drift.ts` module (or inline in triage)
- No new dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — config is dead code, drift is a documented promise |
| Existing code reuse? | **Yes** — `loadConfig()` already exists, just needs to be called |
| Stdlib? | **Yes** — `fs.readFileSync` for history, `JSON.parse` for config |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
