## Why

A comprehensive audit found 4 critical bugs, 10+ documentation inconsistencies, and several code quality issues. The most severe: `calibrateWeight` receives `undefined` producing `NaN` weights across the entire verify pipeline, `session-do` never matches check IDs so always returns `HUMAN`, and `session-archive` double-records history entries. Documentation is significantly out of sync with the codebase.

## What Changes

### Critical Bug Fixes
- **Fix calibrateWeight NaN**: `triage.ts` passes `sensitivity` to `verify()`; `verify.ts` guards against `undefined` in `calibrateWeight`
- **Fix session-do check filtering**: Map check IDs (`run-tests`, `type-check`, `human-review`) to `OracleKind` values (`test-runner`, `type-check`, `lint`)
- **Fix session-archive double recording**: Remove `measureRecord` call from archive (already done in session-do)
- **Create CI workflow**: Add `.github/workflows/ci.yml` (lint → tsc → build → test on linux/macos/windows)

### Documentation Sync
- **docs/mechanics.md**: Add `execute` to pipeline diagram, update skill table to 20 commands, fix runtime loop table
- **docs/verifiability.md**: Fix decision tree to match code, remove level 0 from assess output
- **docs/protocol/learn-result.md**: Add `oraclePrecision` field
- **docs/protocol/verification-report.md**: Add `test-content` oracle kind
- **AGENTS.md**: Add Stage 8, fix Commandment 4 contradiction
- **README.md**: Fix output example to show JSON (matching `veridia <task>` behavior)

### Code Quality
- **formatInvocation**: Change `ww` prefix to `veridia` in `src/agent/agents.ts`
- **Remove dead import**: `computeSensitivity` in `triage.ts` (never called)
- **Remove duplicate isTestsWeak**: Delete local copy in `probe.ts`, import from `weight.ts`

## Capabilities

No new capabilities — bug fixes, docs sync, and code cleanup only.

## Impact

| Area | Impact |
|------|--------|
| `src/triage/triage.ts` | Pass `sensitivity` to verify; remove dead import |
| `src/verify/verify.ts` | Guard against undefined in calibrateWeight |
| `src/verify/weight.ts` | Export `isTestsWeak` for reuse |
| `src/assess/probe.ts` | Remove duplicate `isTestsWeak`, import from weight |
| `src/cli/commands/session-do.ts` | Fix check ID → OracleKind mapping |
| `src/cli/commands/session-archive.ts` | Remove duplicate measureRecord |
| `src/agent/agents.ts` | `ww` → `veridia` in formatInvocation |
| `docs/mechanics.md` | Fix pipeline diagram, skill table, runtime paths |
| `docs/verifiability.md` | Fix decision tree |
| `docs/protocol/learn-result.md` | Add oraclePrecision |
| `docs/protocol/verification-report.md` | Add test-content |
| `AGENTS.md` | Add Stage 8, fix commandment 4 |
| `README.md` | Fix output example |
| `.github/workflows/ci.yml` | New file |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — NaN weights and HUMAN-only verdicts are critical bugs |
| Existing code reuse? | **Yes** — `isTestsWeak` already exists in weight.ts, just need to import |
| Stdlib? | **Yes** — all fixes use existing stdlib |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
