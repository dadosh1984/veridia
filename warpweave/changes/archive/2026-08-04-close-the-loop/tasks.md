## 1. Mutation Sensitivity

- [x] 1.1 Create `src/verify/mutate.ts` — string-level mutation engine
  - **Spec scenario**: Basic mutation, Multiple mutations
  - **Ladder rung**: 3 (stdlib — regex replace, no parser)
  - **Test first**: `test('mutates boolean true to false', ...)`, `test('produces at least 3 mutations', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.2 Add `computeSensitivity()` to `src/verify/mutate.ts` — run oracle against each mutation, compute caught/total
  - **Spec scenario**: Oracle catches mutation, Oracle misses mutation, Perfect oracle, Blind oracle, Partial oracle
  - **Ladder rung**: 3 (stdlib — execFileSync already exists)
  - **Test first**: `test('perfect oracle returns 1.0', ...)`, `test('blind oracle returns 0.0', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.3 Add `calibrateWeight()` to `src/verify/weight.ts` — combine baseWeight × sensitivity × precision
  - **Spec scenario**: Weight adjustment
  - **Ladder rung**: 6 (one-liner — multiplication)
  - **Test first**: `test('calibrateWeight multiplies base by sensitivity and precision', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

- [x] 1.4 Wire calibration into `src/verify/verify.ts` — replace `baseWeight(kind)` with `calibrateWeight(kind, sensitivity, precision)`
  - **Spec scenario**: Weight adjustment
  - **Ladder rung**: 2 (reuse — modify existing verify function)
  - **Test first**: `test('verify uses calibrated weight when sensitivity provided', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

## 2. Historical Precision

- [x] 2.1 Extend `MeasureEntry` in `src/measure/types.ts` with optional `oracleResults` field
  - **Spec scenario**: Successful pass recorded, False pass recorded
  - **Ladder rung**: 2 (reuse — extend existing type)
  - **Test first**: `test('MeasureEntry accepts oracleResults field', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/measure.test.ts`

- [x] 2.2 Add `computePrecision()` to `src/measure/learn.ts` — read history, compute per-oracle precision
  - **Spec scenario**: Reliable oracle, Unreliable oracle
  - **Ladder rung**: 2 (reuse — learn.ts already reads history)
  - **Test first**: `test('computePrecision returns 1.0 for perfect oracle', ...)`, `test('computePrecision returns 0.2 for unreliable oracle', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/learn.test.ts`

- [x] 2.3 Export precision data from learn and make it consumable by verify
  - **Spec scenario**: Weight calibrated, Data survives restart
  - **Ladder rung**: 2 (reuse — history.jsonl already persists)
  - **Test first**: `test('precision data persists across learn calls', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/learn.test.ts`

- [x] 2.4 Wire precision into `src/triage/triage.ts` — pass precision data from learn to verify
  - **Spec scenario**: Weight calibrated
  - **Ladder rung**: 2 (reuse — triage.ts already orchestrates)
  - **Test first**: `test('triage passes precision to verify', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

## 3. Interactive Ask

- [x] 3.1 Create `src/ask/prompt.ts` — interactive prompt using Node `readline`
  - **Spec scenario**: Questions displayed, User selects answer, Invalid input handled
  - **Ladder rung**: 3 (stdlib — readline built-in)
  - **Test first**: `test('promptQuestion displays question and options', ...)`, `test('promptQuestion re-prompts on invalid input', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`

- [x] 3.2 Modify `src/ask/ask.ts` — add interactive mode that calls prompt.ts when not auto
  - **Spec scenario**: Questions displayed, Auto mode skips prompts
  - **Ladder rung**: 2 (reuse — modify existing ask function)
  - **Test first**: `test('ask returns answers when not auto', ...)`, `test('ask skips prompts in auto mode', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/ask.test.ts`

- [x] 3.3 Feed answers into pipeline — modify `AskResult` type and `triage.ts` to pass answers to route/execute
  - **Spec scenario**: Answer affects routing, Answer affects execution
  - **Ladder rung**: 2 (reuse — extend existing types and pipeline)
  - **Test first**: `test('answers affect route plan', ...)`, `test('answers included in execution context', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

## 4. AI Orchestration

- [x] 4.1 Create `src/execute/orchestrate.ts` — model-agnostic AI call interface (stdio + HTTP)
  - **Spec scenario**: Local model via stdio, Remote model via API
  - **Ladder rung**: 2 (reuse — execFileSync pattern from delegate.ts; Node 22 fetch for HTTP)
  - **Test first**: `test('callModelStdio spawns process and returns output', ...)`, `test('callModelHttp makes fetch request', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 4.2 Add context assembly — build prompt from task, type, level, plan, answers
  - **Spec scenario**: Full context prompt
  - **Ladder rung**: 6 (one-liner — template string)
  - **Test first**: `test('assemblePrompt includes all context fields', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 4.3 Add retry loop — on verify FAIL, retry with failure context up to max retries
  - **Spec scenario**: Retry with context, Max retries
  - **Ladder rung**: 3 (stdlib — simple loop)
  - **Test first**: `test('retries on verify failure', ...)`, `test('stops after max retries', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 4.4 Add model config to `VeridiaConfig` in `src/config/config.ts` — provider, model, apiKey, temperature, maxTokens
  - **Spec scenario**: Config from file, API key from env
  - **Ladder rung**: 2 (reuse — extend existing config type)
  - **Test first**: `test('loadConfig reads model settings', ...)`, `test('api key from env overrides config', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/config.test.ts`

- [x] 4.5 Wire orchestration into `src/execute/delegate.ts` — if model configured, call orchestrate instead of shell
  - **Spec scenario**: Output collected, Output verified
  - **Ladder rung**: 2 (reuse — modify existing delegate function)
  - **Test first**: `test('delegate calls orchestrate when model configured', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

## 5. Dogfooding & Run Command

- [x] 5.1 Create `src/cli/commands/run.ts` — `veridia run` command that wraps triage() and shows all stage outputs
  - **Spec scenario**: Full pipeline run, Pipeline stages visible
  - **Ladder rung**: 2 (reuse — wraps existing triage function)
  - **Test first**: `test('run command shows all stage outputs', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 5.2 Add `--ww` / `--change` flags to run command for warpweave integration
  - **Spec scenario**: Change as target
  - **Ladder rung**: 2 (reuse — read warpweave change dir)
  - **Test first**: `test('run --ww --change reads change context', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 5.3 Add `--self` flag to run command — targets veridia project root
  - **Spec scenario**: Self-test
  - **Ladder rung**: 6 (one-liner — pass project root)
  - **Test first**: `test('run --self targets veridia root', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 5.4 Register `run` command in `src/cli/index.ts` and update USAGE string
  - **Spec scenario**: Full pipeline run
  - **Ladder rung**: 2 (reuse — follow existing command pattern)
  - **Test first**: `test('run command appears in help', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 6. Documentation

- [x] 6.1 Update `docs/verifiability.md` — mark mutation sensitivity and historical precision as implemented
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

- [x] 6.2 Update `docs/roadmap.md` — mark Stage 8 as in progress
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
