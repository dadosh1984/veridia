## 1. Ask types and question bank

- [x] 1.1 Create `src/ask/types.ts` with `ClarifyingQuestion { id: string; prompt: string; options: string[] }` and `AskResult { questions: ClarifyingQuestion[] }`
  - **Spec scenario**: Ask emits clarifying questions for level 0/1 (all)
  - **Ladder rung**: 2 (reuse — TS type module, mirrors `src/route/types.ts`)
  - **Test first**: `test/ask.test.ts` type-imports `ClarifyingQuestion`/`AskResult` and compiles under strict TS
  - **Verify**: `rtk pnpm exec tsc --noEmit`
- [x] 1.2 Implement `src/ask/bank.ts` — static question bank keyed by `TaskType`, each type owning 2–3 template questions with options and stable ids
  - **Spec scenario**: Ask emits clarifying questions for level 0/1 (level 1 feature asks two to three questions)
  - **Ladder rung**: 7 (minimum — static per-type template arrays)
  - **Test first**: `test/ask.test.ts` — bank lookup for `feature` yields at least 2 questions each with 2+ options
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`
- [x] 1.3 Implement `src/ask/select.ts` — pure selector `selectQuestions(type, level)`: at level 0 inject an expected-outcome question, at level 1 return the type's standard set, always 2–3 items in deterministic order
  - **Spec scenario**: Ask emits clarifying questions for level 0/1 (level 0 open asks about expectation)
  - **Ladder rung**: 7 (minimum — small pure subsetting function)
  - **Test first**: `test/ask.test.ts` — `selectQuestions('open', 0)` includes an expected-outcome question; `selectQuestions('feature', 1)` returns 2–3 questions
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`
- [x] 1.4 Implement `src/ask/ask.ts` — public `ask(type, level)`: levels 0/1 return `{ questions }`, levels 2/3 return a decline result
  - **Spec scenario**: Ask declines when a mechanical oracle exists (level 3/2 decline)
  - **Ladder rung**: 2 (reuse — orchestrates bank + selector, mirrors `src/route/route.ts`)
  - **Test first**: `test/ask.test.ts` — `ask('bugfix', 3)` returns a decline, `ask('feature', 1)` returns 2–3 questions
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`

## 2. CLI wiring

- [x] 2.1 Extend `src/cli/index.ts` with an `ask` branch: require `--type <TaskType>` and `--level <VerifiabilityLevel>`; missing/invalid values → stderr error + non-zero exit; level 0/1 → print one tab-delimited block per question and exit 0; level 2/3 → print the decline line and exit 0
  - **Spec scenario**: Ask subcommand accepts type and level (both flags / missing type / invalid level), Ask emits questions for 0/1, Ask declines for 2/3
  - **Ladder rung**: 2 (reuse — new branch in existing argv dispatch, mirrors `route`)
  - **Test first**: `test/cli.test.ts` additions — `veridia ask --type feature --level 1` prints question blocks and exits 0; missing `--type` and invalid `--level` exit non-zero with stderr; `--type bugfix --level 3` prints the decline and exits 0
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 2.2 Update `USAGE` text in `src/cli/index.ts` to document the `ask` subcommand
  - **Spec scenario**: Ask subcommand accepts type and level
  - **Ladder rung**: 2 (reuse — edit existing usage string)
  - **Test first**: extend existing CLI help test to assert `ask` appears in usage output
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 3. Corpus and CLI tests

- [x] 3.1 Write `test/ask.test.ts` table-driven suite covering every spec scenario: 2–3 questions for each level 0/1 type, expected-outcome question at level 0, decline for levels 2/3, determinism (repeat runs agree), empty decline has no questions
  - **Spec scenario**: All scenarios in `specs/ask/spec.md`
  - **Ladder rung**: 2 (reuse — `it.each` corpus, mirrors Stage 1–3)
  - **Test first**: the corpus IS the failing test set (RED until ask exists)
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`
- [x] 3.2 Extend `test/cli.test.ts` with end-to-end ask cases through the compiled CLI (`run-cli` helper), including Windows `\r\n` trimming in assertions
  - **Spec scenario**: Ask subcommand accepts type and level (all), Ask emits questions (repeatable questions)
  - **Ladder rung**: 2 (reuse — `test/helpers/run-cli.ts` boots compiled CLI)
  - **Test first**: failing CLI tests for ask first (RED)
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 4. Verification

- [x] 4.1 Run full pipeline: `rtk pnpm lint` → `rtk pnpm exec tsc --noEmit` → `rtk pnpm build` → `rtk pnpm test` all green
  - **Spec scenario**: Ask is deterministic and local (all scenarios end-to-end)
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Test first**: N/A — full-suite run
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk pnpm test`
- [x] 4.2 Manual smoke: `node dist/cli/index.js ask --type feature --level 1` exits 0 and prints question blocks; `node dist/cli/index.js ask --type bugfix --level 3` prints the decline and exits 0 (Stage 4 DoD)
  - **Spec scenario**: Ask emits clarifying questions for level 0/1; Ask declines when a mechanical oracle exists
  - **Ladder rung**: 7 (minimum — manual check)
  - **Test first**: N/A
  - **Verify**: `rtk node dist/cli/index.js ask --type feature --level 1`
