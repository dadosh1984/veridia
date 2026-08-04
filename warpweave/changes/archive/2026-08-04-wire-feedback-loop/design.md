## Context

See `proposal.md`. The feedback loop was implemented in `close-the-loop` but never wired. Three specific breaks:
1. `triage.ts` never calls `computeSensitivity()` — `sensitivity` deps always undefined → defaults to 1
2. `triage.ts` never writes `oracleResults` to `measureRecord()` — `computePrecision()` always returns `{}`
3. `verify.ts` defaults `sens=1, prec=1` — calibration silently no-ops

## Decisions

### 1. Wire computeSensitivity into triage
After verify runs, call `computeSensitivity()` with the correct output and a mock oracle function. Pass result as `sensitivity` deps to the next verify call.

### 2. Wire oracleResults into measureRecord
After verify, compute per-oracle true/false positives from the check results. Write to `MeasureEntry.oracleResults`.

### 3. Remove silent defaults in verify
Change `const sens = deps.sensitivity?.[kind] ?? 1` to `?? baseWeight(kind)` — if no calibration, use base weight directly. Same for precision.

## Data flow

```
triage(task, target)
  │
  ├─ classify → type
  ├─ assess → level, kinds
  ├─ route → plan
  ├─ ask → questions, answers
  │
  ├─ verify(target, level, kinds) → checks, verdict
  │     │
  │     ├─ sensitivity = computeSensitivity(output, oracleFn)
  │     └─ precision = computePrecision(history)
  │
  ├─ measureRecord({..., oracleResults})
  │
  └─ return result
```

## Tasks

- [x] 1.1 Wire `computeSensitivity()` into `triage.ts` — call after verify, pass as deps
- [x] 1.2 Wire `oracleResults` into `measureRecord()` in `triage.ts`
- [x] 1.3 Remove default `sens=1, prec=1` in `verify.ts` — use baseWeight when no calibration
- [x] 1.4 Add e2e test: verify that sensitivity + precision affect verdict
