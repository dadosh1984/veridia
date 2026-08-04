## Context

See `proposal.md`. We add live stage visibility to the triage pipeline so `veridia run` shows which command is active.

## Decisions

### 1. Optional `progress` on `TriageOptions`
```ts
export interface TriageOptions {
  auto?: boolean;
  progress?: (stage: string, detail?: string) => void;
}
```
`triage()` calls `options.progress?.(stage, detail)` at each stage. It is an observation hook — it never changes the result, verdict, or which stages run.

### 2. Where to hook the stages
Each line must communicate the **decision**, not just the step name — this is what makes veridia's method visible and distinguishes it from "any model." :warning: add decision detail (e.g. which oracles drove the level), not noise.

| Stage label | Point in `triage()` | detail — the decision, not just the step |
|---|---|---|
| classify | after `classify(...)` | `feature (0.31)` — chosen type + confidence |
| assess | after `assess(...)` | `level 3 · type-check, test-runner` — which oracles set the level |
| route | after `buildPlan(...)` | `full-tdd / cheapest` — chosen depth + tier |
| ask | before/after `askFn` | `2 questions` — how many clarifications |
| plan | after `buildExecutionPlan(...)` | `4 steps · 3 gates` — what will run |
| execute | around `delegate(...)` | host delegation mode |
| verify | after `verify(...)` | `PASS/FAIL/HUMAN` — the verdict gate |
| measure | after `measureRecord(...)` | `recorded` — learning step |

### 3. `run.ts` prints live lines
`run.ts` passes `progress` that writes `→ ${stage}: ${detail}` to stdout before the existing end summary. JSON-emitting commands (bare `veridia <task>`) are unchanged — progress is scoped to the human-readable `run`.

## Tasks

- [ ] 1.1 Add optional `progress` to `TriageOptions` and invoke at each stage in `src/triage/triage.ts`
  - **Ladder rung**: 2 (reuse — existing stage calls)
  - **Test first**: `test('triage emits progress across stages', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [ ] 1.2 Wire `run.ts` to print `→ <stage>` lines via progress to stdout
  - **Ladder rung**: 1 (YAGNI — a few write calls)
  - **Test first**: covered by 1.1 + CLI e2e
  - **Verify**: `rtk pnpm exec tsc --noEmit`
