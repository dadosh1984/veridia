## 1. Route types and mapping core

- [x] 1.1 Create `src/route/types.ts` with `RunPlan { depth; tier; trust; steps: string[]; checks: string[] }` where `depth` is `'full-tdd' | 'tdd-where-possible' | 'minimal' | 'just-do-it'` and `tier` is `'cheapest' | 'mid' | 'any'`
  - **Spec scenario**: Route prints a run plan (all scenarios)
  - **Ladder rung**: 2 (reuse — TS type module, mirrors `src/classify/types.ts`)
  - **Test first**: `test/route.test.ts` type-imports `RunPlan` and compiles under strict TS
  - **Verify**: `rtk pnpm exec tsc --noEmit`
- [x] 1.2 Implement `src/route/map-level.ts` — pure level gate: 3 → full-tdd/cheapest/trust-verifier, 2 → tdd-where-possible/mid/verify-structure, 1 → minimal/any/trust-human, 0 → just-do-it/cheapest/human-floor
  - **Spec scenario**: Route prints a run plan (full/partial/human-only/no-verifiability plans)
  - **Ladder rung**: 7 (minimum — small static switch over four levels, no engine)
  - **Test first**: `test/route.test.ts` — `mapLevel(3)` names full-tdd, `mapLevel(2)` mid-tier, `mapLevel(1)` minimal, `mapLevel(0)` cheapest
  - **Verify**: `rtk pnpm exec vitest run test/route.test.ts`
- [x] 1.3 Implement `src/route/map-type.ts` — pure type modulation returning step-list overrides: explore/open drop execute-verify, doc/feature narrow steps, bugfix/refactor keep full TDD
  - **Spec scenario**: Task type modulates the plan steps (explore omits TDD loop, bugfix includes it)
  - **Ladder rung**: 7 (minimum — static per-type step arrays)
  - **Test first**: `test/route.test.ts` — `mapType('explore')` excludes the execute-verify step, `mapType('bugfix')` includes it
  - **Verify**: `rtk pnpm exec vitest run test/route.test.ts`
- [x] 1.4 Assemble `src/route/route.ts` — `buildPlan(type, level)` merging level base + type steps in fixed order, returning `RunPlan`; export `route(type, level)`
  - **Spec scenario**: Route prints a run plan (all), Task type modulates the plan steps (every plan lists steps and checks)
  - **Ladder rung**: 2 (reuse — orchestrates level + type partials, mirrors `src/assess/assess.ts`)
  - **Test first**: `test/route.test.ts` — `route('feature', 2)` returns depth mid/tier mid and steps+checks arrays
  - **Verify**: `rtk pnpm exec vitest run test/route.test.ts`

## 2. CLI wiring

- [x] 2.1 Extend `src/cli/index.ts` with a `route` branch: require `--type <TaskType>` and `--level <VerifiabilityLevel>`; missing/invalid values → stderr error + non-zero exit; otherwise print the plan fields and exit 0
  - **Spec scenario**: Route subcommand accepts type and level (both flags / missing level / invalid type / invalid level)
  - **Ladder rung**: 2 (reuse — new branch in existing argv dispatch, mirrors `assess`)
  - **Test first**: `test/cli.test.ts` additions — `veridia route --type feature --level 2` prints a plan and exits 0; missing `--level` and invalid `--type`/`--level` exit non-zero with stderr
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 2.2 Update `USAGE` text in `src/cli/index.ts` to document the `route` subcommand
  - **Spec scenario**: Route subcommand accepts type and level
  - **Ladder rung**: 2 (reuse — edit existing usage string)
  - **Test first**: extend existing CLI help test to assert `route` appears in usage output
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 3. Corpus and CLI tests

- [x] 3.1 Write `test/route.test.ts` table-driven suite covering every spec scenario: level plans (0–3), type modulation, determinism (repeat runs agree), steps/checks present in every plan
  - **Spec scenario**: All scenarios in `specs/route/spec.md`
  - **Ladder rung**: 2 (reuse — `it.each` corpus, mirrors Stage 1/2)
  - **Test first**: the corpus IS the failing test set (RED until route exists)
  - **Verify**: `rtk pnpm exec vitest run test/route.test.ts`
- [x] 3.2 Extend `test/cli.test.ts` with end-to-end route cases through the compiled CLI (`run-cli` helper), including Windows `\r\n` trimming in assertions
  - **Spec scenario**: Route subcommand accepts type and level (all), Route prints a run plan (repeatable plan)
  - **Ladder rung**: 2 (reuse — `test/helpers/run-cli.ts` boots compiled CLI)
  - **Test first**: failing CLI tests for route first (RED)
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 4. Verification

- [x] 4.1 Run full pipeline: `rtk pnpm lint` → `rtk pnpm exec tsc --noEmit` → `rtk pnpm build` → `rtk pnpm test` all green
  - **Spec scenario**: Route is deterministic and local (all scenarios end-to-end)
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Test first**: N/A — full-suite run
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk pnpm test`
- [x] 4.2 Manual smoke: `node dist/cli/index.js route --type feature --level 3` exits 0 and prints a plan; missing `--level` exits non-zero (Stage 3 DoD)
  - **Spec scenario**: Route subcommand accepts type and level; Route prints a run plan
  - **Ladder rung**: 7 (minimum — manual check)
  - **Test first**: N/A
  - **Verify**: `rtk node dist/cli/index.js route --type feature --level 3`
