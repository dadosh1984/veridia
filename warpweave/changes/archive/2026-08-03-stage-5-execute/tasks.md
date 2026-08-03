## 1. Verify types

- [x] 1.1 Create `src/verify/types.ts` with `CheckKit`/`Check { kind: OracleKind; command: string; weight: number; weak: boolean; passed: boolean }`, `Verdict = 'PASS' | 'FAIL' | 'HUMAN'`, and `VerifyResult { checks: Check[]; verdict: Verdict }`
  - **Spec scenario**: Verify gates on a verdict (all), Verify weighs oracles against theater
  - **Ladder rung**: 2 (reuse — TS type module, mirrors `src/ask/types.ts`)
  - **Test first**: `test/verify.test.ts` type-imports `Check`/`Verdict`/`VerifyResult` and compiles under strict TS
  - **Verify**: `rtk pnpm exec tsc --noEmit`

## 2. Oracle resolution and execution

- [x] 2.1 Implement `src/verify/resolve.ts` — map `OracleKind` to runnable command: test-runner → `package.json.scripts.test` else default, type-check → `scripts.typecheck`/`type-check`/`tsc --noEmit`, lint → `scripts.lint`/`eslint .`; never executes arbitrary scripts
  - **Spec scenario**: Verify discovers and runs oracle commands (test runner detected, no oracles detected)
  - **Ladder rung**: 3 (stdlib — read `package.json` via node:fs)
  - **Test first**: `test/verify.test.ts` — `resolveCommands(['test-runner'], target)` yields a runnable test command from `package.json`; `[type-check]` falls back to `tsc --noEmit` when no script
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`
- [x] 2.2 Implement `src/verify/run.ts` — run a command against a target via an injectable `run` seam `(cwd, command) => { exitCode }`, defaulting to stdlib `child_process.execFileSync`; never hangs (bounded timeout)
  - **Spec scenario**: Verify discovers and runs oracle commands (command failure is reported)
  - **Ladder rung**: 3 (stdlib — `child_process.execFileSync` + explicit seam)
  - **Test first**: `test/verify.test.ts` — injected runner returns exit 0 → reported passed, exit non-zero → failed
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

## 3. Weighting and verdict

- [x] 3.1 Implement `src/verify/weight.ts` — static weight per kind (test-runner=3, type-check=2, lint=1; CI = 0/weak, not portable-weight), plus a mechanical weakness scan flagging the test-runner weak when discovered test files have no `test`/`it`/`expect`/`assert` tokens
  - **Spec scenario**: Verify weighs oracles against theater (empty tests are weak, test runner beats lint)
  - **Ladder rung**: 3 (stdlib — regex token scan over test files)
  - **Test first**: `test/verify.test.ts` — weight('test-runner') > weight('lint'); fixture with no test tokens marks the test-runner weak
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`
- [x] 3.2 Implement `src/verify/verify.ts` — orchestrator `verify(oracles, resolve, runOn)`: resolve → run a check per port oracle → weigh weak/strong → `deriveVerdict(level, checks)`; plus pure `deriveVerdict`
  - **Spec scenario**: Verify gates on a verdict (level 3 all green → PASS, strong fail → FAIL, level 2 → PASS+human, level 1 → HUMAN)
  - **Ladder rung**: 7 (pure verdict switch), 2 (orchestrates, mirrors `src/route/route.ts`)
  - **Test first**: `test/verify.test.ts` — deriveVerdict(3, all strong passed) = PASS; deriveVerdict(3, one strong failed) = FAIL; deriveVerdict(1, ...) = HUMAN; verify() with injected runner returns matching checks+verdict
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

## 4. CLI wiring

- [x] 4.1 Extend `src/cli/index.ts` with a `verify` branch: require `--target <path>` (or positional), `--type`, `--level`, all validated; missing target path → stderr + exit 1; otherwise print one tab-delimited line per check + a verdict line and exit 0
  - **Spec scenario**: Verify subcommand accepts target, type, level (all flags / missing type / missing target / invalid level), Verify gates on a verdict
  - **Ladder rung**: 2 (reuse — new branch in existing argv dispatch, mirrors `route`)
  - **Test first**: `test/cli.test.ts` additions — `veridia verify --target <tmp> --type feature --level 2` prints check lines + verdict and exits 0; missing `--type`/missing target/invalid `--level` exit non-zero with stderr
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 4.2 Update `USAGE` text in `src/cli/index.ts` to document the `verify` subcommand
  - **Spec scenario**: Verify subcommand accepts target, type, level
  - **Ladder rung**: 2 (reuse — edit existing usage string)
  - **Test first**: extend existing CLI help test to assert `verify` appears in usage output
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 5. Corpus and CLI tests

- [x] 5.1 Write `test/verify.test.ts` table-driven suite covering every spec scenario: resolution, run pass/fail via injected runner, weakness (empty tests weak), weight ordering, verdict for levels 0–3, determinism (repeat runs agree), no-oracle → HUMAN
  - **Spec scenario**: All scenarios in `specs/verify/spec.md`
  - **Ladder rung**: 2 (reuse — `it.each` corpus, mirrors Stage 1–4)
  - **Test first**: the corpus IS the failing test set (RED until verify exists)
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`
- [x] 5.2 Extend `test/cli.test.ts` with end-to-end verify cases through the compiled CLI (`run-cli` helper); verify on this repo's tmp fixture uses the real runner for a smoke-level check
  - **Spec scenario**: Verify subcommand accepts target, type, level (all), Verify gates on a verdict
  - **Ladder rung**: 2 (reuse — `test/helpers/run-cli.ts`)
  - **Test first**: failing CLI tests for verify first (RED)
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 6. Verification

- [x] 6.1 Run full pipeline: `rtk pnpm lint` → `rtk pnpm exec tsc --noEmit` → `rtk pnpm build` → `rtk pnpm test` all green
  - **Spec scenario**: Verify is deterministic and local (all scenarios end-to-end)
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk pnpm test`
- [x] 6.2 Manual smoke: `node dist/cli/index.js verify --target <tmp-pkg-with-true-test> --type feature --level 3` exits 0 and prints verdict PASS (or FAIL); `node dist/cli/index.js verify --target <missing> --type feature --level 2` exits non-zero (Stage 5 DoD)
  - **Spec scenario**: Verify subcommand accepts target, type, level; Verify gates on a verdict
  - **Ladder rung**: 7 (minimum — manual check)
  - **Verify**: `rtk node dist/cli/index.js verify --target . --type feature --level 3`