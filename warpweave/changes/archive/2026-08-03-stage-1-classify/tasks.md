## 1. Classifier core

- [x] 1.1 Create `src/classify/types.ts` with the `TaskType` union (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open`) and `Classification` interface (type + confidence)
  - **Spec scenario**: Task type taxonomy (all scenarios)
  - **Ladder rung**: 2 (reuse — TS type module, mirrors Stage 0 pattern)
  - **Test first**: `test/classify.test.ts` type-imports `TaskType`/`Classification` and compiles under strict TS
  - **Verify**: `rtk pnpm exec tsc --noEmit`
- [x] 1.2 Implement `src/classify/classify.ts` — deterministic pattern table (one `{type, patterns}` entry per taxonomy type) scoring matched signals and returning a clamped confidence
  - **Spec scenario**: Task type taxonomy (all), Deterministic output with confidence (both), Ambiguous task falls back to open
  - **Ladder rung**: 7 (minimum — compact pattern/score table, stdlib String methods, no library)
  - **Test first**: `test/classify.test.ts` — `it.each` corpus asserting type + confidence bounds per scenario
  - **Verify**: `rtk pnpm exec vitest run test/classify.test.ts`
- [x] 1.3 Ensure identical input yields identical output (pure function, no state, no randomness) — determinism test calls classifier twice
  - **Spec scenario**: Deterministic output with confidence — Repeatable result
  - **Ladder rung**: 6 (one-liner — pure function, assert equal on second call)
  - **Test first**: `test('same input → same type and confidence', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/classify.test.ts`

## 2. CLI wiring

- [x] 2.1 Extend `src/cli/index.ts` dispatch with a `classify` branch: join extra argv tokens into one task string; missing task → stderr error + non-zero exit; otherwise print `type\tconfidence` and exit 0
  - **Spec scenario**: Classify command (all scenarios), Exit status contract (both)
  - **Ladder rung**: 2 (reuse — new branch in existing Stage 0 argv dispatch)
  - **Test first**: `test/cli.test.ts` additions — `veridia classify "fix the null pointer in login"` prints `bugfix`, missing-arg case prints error + non-zero exit
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 2.2 Verify end-to-end: rebuild (`node build.js`) and run `node dist/cli/index.js classify "<task>"` for each taxonomy type
  - **Spec scenario**: Classify command (all scenarios), Task type taxonomy (all)
  - **Ladder rung**: 7 (minimum — run existing checks, no new code)
  - **Test first**: N/A — manual smoke
  - **Verify**: `rtk node dist/cli/index.js classify "add dark mode support"`

## 3. Corpus tests

- [x] 3.1 Write `test/classify.test.ts` table-driven corpus covering every spec scenario (bugfix/feature/doc/refactor/explore/open + ambiguous fallback + confidence bounds + determinism)
  - **Spec scenario**: All scenarios in `specs/classify/spec.md`
  - **Ladder rung**: 2 (reuse — `it.each` corpus, mirrors Stage 0 harness)
  - **Test first**: the corpus IS the failing test set (RED until classifier exists)
  - **Verify**: `rtk pnpm exec vitest run test/classify.test.ts`

## 4. Verification

- [x] 4.1 Run full suite: `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test` all green
  - **Spec scenario**: Exit status contract + all classify scenarios end-to-end
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Test first**: N/A — full-suite run
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk vitest run`
- [x] 4.2 Manual smoke: `node dist/cli/index.js classify "fix the null pointer in login"` exits 0; `node dist/cli/index.js classify` exits non-zero (Stage 1 DoD)
  - **Spec scenario**: Classify command; Exit status contract
  - **Ladder rung**: 7 (minimum — manual check)
  - **Test first**: N/A
  - **Verify**: `rtk node dist/cli/index.js classify "fix the null pointer in login"`
