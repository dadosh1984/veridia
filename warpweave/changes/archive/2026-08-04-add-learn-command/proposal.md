## Why

veridia claims to "learn from its own misses" but `measureHistory` only counts PASS/FAIL per level. No analysis, no recommendations, no self-correction. The `drift` field exists but is never used to improve future runs.

## What Changes

- New `veridia learn` command that analyzes `history.jsonl`
- Computes: classification accuracy by type, success rate by level, recurring drift patterns
- Returns structured JSON with recommendations
- No new dependencies

## Capabilities

### New Capabilities
- `learn`: Analyze history and produce recommendations

### Modified Capabilities
- (none)

## Impact

- `src/measure/learn.ts` — new module: history analysis + recommendations
- `src/cli/index.ts` — new `learn` subcommand
- `src/measure/history.ts` — export `readHistory` for learn module

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — self-measurement is core philosophy |
| Existing code reuse? | **Yes** — `readHistory`, `buildSummary` already exist |
| Stdlib? | **Yes** — `fs.readFileSync`, `JSON.parse` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
