## Context

See `proposal.md`. Four critical bugs, 10+ doc inconsistencies, and several code quality issues found in comprehensive audit.

## Decisions

### 1. calibrateWeight NaN fix
Pass `sensitivity` from triage to verify. Guard against undefined in calibrateWeight by defaulting to 1.

### 2. session-do check mapping
Map check IDs from route plan to OracleKind: `run-tests` → `test-runner`, `type-check` → `type-check`, `human-review` → `lint`.

### 3. session-archive double recording
Remove `measureRecord` call from archive. Session is already recorded in session-do.

### 4. CI workflow
Standard GitHub Actions: pnpm setup, Node 22, lint → tsc → build → test on linux/macos/windows.

### 5. isTestsWeak dedup
Export from `weight.ts`, import in `probe.ts`, remove local copy.

## Tasks

- [ ] 1.1 Fix `calibrateWeight` NaN — pass sensitivity from triage, guard against undefined
- [ ] 1.2 Fix `session-do` check filtering — map check IDs to OracleKind
- [ ] 1.3 Fix `session-archive` double recording — remove duplicate measureRecord
- [ ] 1.4 Create `.github/workflows/ci.yml`
- [ ] 1.5 Fix `formatInvocation` — `ww` → `veridia`
- [ ] 1.6 Remove dead `computeSensitivity` import from triage.ts
- [ ] 1.7 Deduplicate `isTestsWeak` — export from weight.ts, import in probe.ts
- [ ] 1.8 Fix `docs/mechanics.md` — pipeline diagram, skill table, runtime paths
- [ ] 1.9 Fix `docs/verifiability.md` — decision tree, level 0
- [ ] 1.10 Fix `docs/protocol/learn-result.md` — add oraclePrecision
- [ ] 1.11 Fix `docs/protocol/verification-report.md` — add test-content
- [ ] 1.12 Fix `AGENTS.md` — add Stage 8, fix commandment 4
- [ ] 1.13 Fix `README.md` — output example
