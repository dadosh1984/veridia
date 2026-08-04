## Why

Mutation sensitivity and historical precision were implemented in `close-the-loop` but never connected into a working cycle. `computeSensitivity()` is never called from the pipeline. `oracleResults` is never written to `MeasureEntry`, so `computePrecision()` always returns `{}`. The `sensitivity` and `precision` deps in `verify()` default to 1, meaning no calibration ever happens. The unique feature of veridia exists only as dead code.

## What Changes

- **Wire computeSensitivity into triage.ts**: After verify runs, call `computeSensitivity()` on the correct output, pass result as `sensitivity` deps to verify
- **Wire oracleResults into measureRecord**: After verify, record per-oracle true/false positives in `MeasureEntry.oracleResults`
- **Remove defaults in verify.ts**: Remove default `sens=1, prec=1` so calibration is explicit — if no data, weight stays at baseWeight (no silent no-op)
- **Add e2e test for feedback loop**: Test that mutation sensitivity + historical precision actually affect verdict

## Capabilities

### Modified Capabilities
- `mutation-sensitivity`: Wire `computeSensitivity()` into the triage pipeline so it actually runs
- `historical-precision`: Wire `oracleResults` into `measureRecord()` so precision data accumulates
- `verify`: Remove silent defaults for sensitivity/precision; calibration must be explicit

## Impact

| Area | Impact |
|------|--------|
| `src/triage/triage.ts` | Call `computeSensitivity()`, pass `sensitivity` to verify, pass `oracleResults` to measureRecord |
| `src/verify/verify.ts` | Remove default `sens=1, prec=1` — require explicit calibration |
| `src/verify/mutate.ts` | No changes (already implemented) |
| `src/measure/learn.ts` | No changes (already implemented) |
| `test/` | New e2e test for feedback loop |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without this, mutation sensitivity and historical precision are dead code |
| Existing code reuse? | **Yes** — all functions exist, just need to wire them |
| Stdlib? | **Yes** — no new dependencies |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
