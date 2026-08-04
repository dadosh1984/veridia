## Context

See `proposal.md` — Why and What Changes. The current codebase has all six pipeline stages implemented but none of the feedback loops are closed:

- `src/verify/weight.ts` — static weights only (test-runner=3, type-check=2, lint=1, ci=0)
- `src/verify/verify.ts` — calls `baseWeight()` directly, no calibration
- `src/measure/learn.ts` — computes stats but nothing consumes them
- `src/ask/ask.ts` — returns questions in JSON, no interactive prompt
- `src/execute/delegate.ts` — stdout/file/shell only, no AI model calls
- `src/triage/triage.ts` — orchestrates pipeline, `calculateDrift` is a side effect

## Goals / Non-Goals

**Goals:**
- Oracle weights adapt to real-world performance (mutation sensitivity + historical precision)
- Interactive ask mode via terminal (readline)
- AI model orchestration via pluggable interface (stdio for local, HTTP for remote)
- `veridia run` command for full pipeline + execution
- Dogfooding: veridia can run against its own source and warpweave changes

**Non-Goals:**
- Not building a chat UI or IDE plugin
- Not supporting streaming output (synchronous only for now)
- Not adding a model marketplace or model discovery
- Not implementing the full Stage 8 AI integration (just the orchestration layer — model calling, retry, verify loop)

## Decisions

### 1. Mutation sensitivity: mutate output strings, not ASTs

| Alternative | Verdict |
|------------|---------|
| Full AST-level mutation (like Stryker) | **Rejected** — requires parser per language, heavy dependency |
| String-level mutation (replace tokens, swap conditions, delete lines) | **Chosen** — stdlib only, language-agnostic, ponytail rung 3 |

String-level mutation is sufficient for the purpose: we're not testing test quality (that's Stryker's job), we're testing whether an oracle can distinguish correct from broken. A simple mutation like `true → false`, `=== → !==`, or deleting a line is enough to catch a weak oracle.

### 2. Historical precision: extend MeasureEntry, not a new file

| Alternative | Verdict |
|------------|---------|
| New `oracle_precision.jsonl` file | **Rejected** — two files to keep in sync |
| Add `oracleResults` field to existing `MeasureEntry` | **Chosen** — single source of truth, learn.ts already reads history |

### 3. Interactive ask: readline, no dependency

| Alternative | Verdict |
|------------|---------|
| inquirer/prompts npm package | **Rejected** — new dependency for a simple prompt loop |
| Node `readline` built-in module | **Chosen** — stdlib, zero dependencies, ponytail rung 3 |

### 4. AI orchestration: stdio-first, HTTP-second

| Alternative | Verdict |
|------------|---------|
| Only HTTP API (OpenAI-compatible) | **Rejected** — excludes local models (ollama, llama.cpp) |
| Only stdio | **Rejected** — excludes cloud APIs |
| Both, with stdio as default | **Chosen** — model-agnostic by design, ponytail rung 2 (reuse existing patterns from delegate.ts) |

### 5. Calibration: combine sensitivity × precision into a single weight factor

Sensitivity (static, from mutation) and precision (dynamic, from history) are independent signals. Combined as `calibratedWeight = baseWeight × sensitivity × precision`. If either is 0, the oracle is effectively disabled. If both are 1, the oracle gets full weight.

## Architecture

```
BEFORE:                              AFTER:
┌──────────┐                         ┌──────────┐
│  verify  │──baseWeight()──▶ check  │  verify  │──calibrate()──▶ check
└──────────┘                         └──────────┘
                                            ▲
                                            │
┌──────────┐                         ┌──────────┐
│  learn   │──stats→stdout           │  learn   │──precision──┘
└──────────┘                         └────┬─────┘
                                          │
┌──────────┐                         ┌──────────┐
│  ask     │──questions→JSON        │  ask     │──readline──▶ answers
└──────────┘                         └──────────┘

┌──────────┐                         ┌──────────┐
│ execute  │──stdout/file/shell      │ execute  │──+ AI model call
└──────────┘                         └──────────┘

┌──────────┐                         ┌──────────┐
│ triage   │──pipeline               │ triage   │──+ feedback loop
└──────────┘                         └──────────┘
```

### Data flow: calibration

```
verify(target, level, kinds)
  │
  ├─ resolveCommands(kinds, target) → [{kind, command}]
  │
  ├─ for each command:
  │     ├─ run → exitCode
  │     ├─ mutate(correctOutput) → mutations
  │     ├─ for each mutation: run oracle → sensitivity = caught / total
  │     └─ precision = readHistory → per-oracle precision
  │
  ├─ calibratedWeight = baseWeight(kind) × sensitivity × precision
  │
  └─ check = {kind, command, weight: calibratedWeight, weak, passed}
```

### Data flow: interactive ask

```
ask(type, level, auto?)
  │
  ├─ if auto or level ≥ 2: return {questions: []}
  │
  ├─ questions = selectQuestions(type, level)
  │
  ├─ for each question:
  │     ├─ display: "${prompt}\n1) ${opt1}\n2) ${opt2}\n..."
  │     ├─ readline → answer index
  │     └─ record answer
  │
  └─ return {questions, answers}
```

### Data flow: AI orchestration

```
execute(task, type, level, plan, target)
  │
  ├─ buildExecutionPlan → execPlan
  │
  ├─ if model configured:
  │     ├─ assemblePrompt(task, type, level, plan, context)
  │     ├─ callModel(prompt) → output
  │     ├─ verify(output) → verdict
  │     ├─ if FAIL and retries < max: retry with failure context
  │     └─ return {output, verdict, retries}
  │
  └─ else: delegate(execPlan, target)  (existing behavior)
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| String-level mutation produces invalid syntax | Only mutate in ways that preserve basic syntax (swap boolean, swap operator, delete line). Accept that some mutations will be caught by syntax errors — that's still a valid signal. |
| Historical precision requires many runs to converge | Start with static weights only. Precision only kicks in after ≥5 runs per oracle. Document that early runs use uncalibrated weights. |
| AI model call can hang | Use `execFileSync` with timeout (same pattern as `delegateShell`). Default 120s, configurable. |
| Interactive ask blocks in non-TTY environments | `--auto` flag skips interactive mode. Detect TTY and fall back to auto if not available. |
| Dogfooding could create circular dependency | veridia doesn't need itself to run. Dogfooding is optional — `veridia run` works on any project. The `--self` flag is convenience, not a requirement. |

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Mutation engine | 3 (stdlib) | String-level mutation using regex replace, no parser |
| Historical precision storage | 2 (reuse) | Extend existing `MeasureEntry` with `oracleResults` field |
| Interactive prompt | 3 (stdlib) | Node `readline` module, no dependency |
| AI model interface | 2 (reuse) | Same `execFileSync` pattern as `delegateShell` for stdio; `fetch` (Node 22+) for HTTP |
| Calibration formula | 6 (one-liner) | `baseWeight × sensitivity × precision` |
| `veridia run` command | 2 (reuse) | Wraps existing `triage()` function |
| Dogfooding `--self` flag | 2 (reuse) | Passes project root as target |
