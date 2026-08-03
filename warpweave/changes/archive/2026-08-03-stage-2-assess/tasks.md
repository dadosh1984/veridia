## 1. Assess types and probe core

- [x] 1.1 Create `src/assess/types.ts` with `VerifiabilityLevel` (`0` | `1` | `2` | `3`), `OracleKind` (`test-runner` | `type-check` | `lint` | `ci`), `Oracle { kind; }`, and `Assessment { level; oracles; }`
  - **Spec scenario**: Assess returns a verifiability level (all scenarios), Assess lists detected oracles (all)
  - **Ladder rung**: 2 (reuse — TS type module, mirrors `src/classify/types.ts`)
  - **Test first**: `test/assess.test.ts` type-imports the types and compiles under strict TS
  - **Verify**: `rtk pnpm exec tsc --noEmit`
- [x] 1.2 Implement `src/assess/probe.ts` — declarative oracle probe table (test-runner/type-check/lint/ci) using `path.join` + `existsSync` on whitelisted paths and bounded-size regex sniff over config files; never walks `node_modules`
  - **Spec scenario**: Assess lists detected oracles (oracles present / no oracles present)
  - **Ladder rung**: 7 (minimum — fixed `existsSync`/regex table, stdlib `node:fs` only)
  - **Test first**: `test/assess.test.ts` — fake `fsLike` reporting a `vitest.config.ts` detects `test-runner`; empty fs detects nothing
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`
- [x] 1.3 Keep probe injectable (accept an `fsLike` seam) so tests run on in-memory/tmp dirs without fixture repos
  - **Spec scenario**: Assess is deterministic and local (offline operation)
  - **Ladder rung**: 3 (stdlib — constructor/dependency-injection param, no framework)
  - **Test first**: same tests run against an injected `fsLike` object and against a real tmp dir with identical results
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

## 2. Level mapping

- [x] 2.1 Implement `src/assess/map-level.ts` — pure `mapLevel(detections, taskHint)` returning 1 (no oracles) / at least 2 (type-check present) / 3 (tests + deterministic task); deterministic defaults true when tests exist unless a `--type` hint says otherwise
  - **Spec scenario**: Assess returns a verifiability level (no oracles → 1, compiler/type-check → ≥2, tests covering target → 3, deterministic task strengthens → 3)
  - **Ladder rung**: 7 (minimum — small pure function, no rule engine)
  - **Test first**: `test/assess.test.ts` — `mapLevel([])` is 1, `mapLevel([type-check])` is 2, `mapLevel([test-runner])` is 3 (deterministic default), `mapLevel([test-runner], 'explore')` stays below 3
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`
- [x] 2.2 Assemble `src/assess/assess.ts` — public `assess(target, fsLike?)` running probe → mapLevel → `Assessment`
  - **Spec scenario**: Assess returns a verifiability level (all), Assess lists detected oracles (all)
  - **Ladder rung**: 2 (reuse — orchestrates probe + mapper, mirrors `classify` module boundary)
  - **Test first**: `test/assess.test.ts` — `assess()` on a dir with `tsconfig.json` returns level ≥ 2 and a `type-check` oracle
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

## 3. CLI wiring

- [x] 3.1 Extend `src/cli/index.ts` with an `assess` branch: `--target <path>` or positional path, default cwd; missing target path → stderr error + non-zero exit; otherwise print `level\toracle1,oracle2` and exit 0
  - **Spec scenario**: Assess subcommand accepts a target path (all), Assess returns a verifiability level (no oracles → 1)
  - **Ladder rung**: 2 (reuse — new branch in existing argv dispatch, mirrors `classify`)
  - **Test first**: `test/cli.test.ts` additions — `veridia assess --target <tmp>` prints a level line; `--target <missing>` prints stderr error + non-zero exit
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 3.2 Update `USAGE` text in `src/cli/index.ts` to document the `assess` subcommand
  - **Spec scenario**: Assess subcommand accepts a target path (no target given)
  - **Ladder rung**: 2 (reuse — edit existing usage string)
  - **Test first**: extend existing CLI help test to assert `assess` appears in usage output
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 4. Corpus and CLI tests

- [x] 4.1 Write `test/assess.test.ts` fixture-based suite covering every spec scenario: oracle detection per kind, level derivation (1/2/3), empty-oracle list, determinism (repeat runs agree), missing-target error
  - **Spec scenario**: All scenarios in `specs/assess/spec.md`
  - **Ladder rung**: 2 (reuse — tmp-dir fixtures + `it.each`, mirrors Stage 1 corpus style)
  - **Test first**: the corpus IS the failing test set (RED until assess exists)
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`
- [x] 4.2 Extend `test/cli.test.ts` with end-to-end assess cases through the compiled CLI (`run-cli` helper), including Windows `\r\n` trimming in assertions
  - **Spec scenario**: Assess subcommand accepts a target path (all), Assess returns a verifiability level (all)
  - **Ladder rung**: 2 (reuse — `test/helpers/run-cli.ts` boots compiled CLI)
  - **Test first**: failing CLI tests for assess first (RED)
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 5. Verification

- [x] 5.1 Run full pipeline: `rtk pnpm lint` → `rtk pnpm exec tsc --noEmit` → `rtk pnpm build` → `rtk pnpm test` all green
  - **Spec scenario**: Assess is deterministic and local (all scenarios end-to-end)
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Test first**: N/A — full-suite run
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk pnpm test`
- [x] 5.2 Manual smoke: `node dist/cli/index.js assess` on this repo exits 0 and prints a level with `test-runner`-related oracles; `node dist/cli/index.js assess --target <missing>` exits non-zero (Stage 2 DoD)
  - **Spec scenario**: Assess subcommand accepts a target path; Assess returns a verifiability level
  - **Ladder rung**: 7 (minimum — manual check)
  - **Test first**: N/A
  - **Verify**: `rtk node dist/cli/index.js assess --target .`
