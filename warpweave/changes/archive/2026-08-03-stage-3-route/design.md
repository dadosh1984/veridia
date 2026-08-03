## Context

- See proposal.md - Why for motivation; specs/route/spec.md for the behavior contract.
- Existing code: `src/classify/types.ts` already exports the `TaskType` union; `src/cli/index.ts` is a flat argv dispatcher with `classify`/`assess` branches. `route` is the first stage that consumes *both* Stage 1 and Stage 2 outputs.
- Source of truth for the mapping: docs/mechanics.md §3 (verifiability → orchestration/routing/trust table). No other policy exists yet — the run-plan step lists are new.
- Constraints (AGENTS.md): TDD; stdlib only; deterministic output; build = `pnpm build`, tests boot compiled `dist/cli/index.js`.

## Goals / Non-Goals

**Goals:**
- A `src/route/` module with a pure, static mapping: `(TaskType, VerifiabilityLevel) → RunPlan`.
- Run plan carries orchestration depth, model tier, trust stance, steps, checks.
- CLI branch `route` validating `--type`/`--level` and printing the plan.

**Non-Goals:**
- Config-file-driven routing (Stage 7), model-tier registry with real prices, or any AI/model call.
- Writing the plan to a file/status record (Stage 7 integration).
- Reusing the classified type from `classify` inside `route`'s CLI — `route` takes explicit flags so it is testable standalone.

## Decisions

**D1. Types mirror Stage 1/2 and stay in `src/route/types.ts`.**
`RunPlan { depth: 'full-tdd' | 'tdd-where-possible' | 'minimal' | 'just-do-it'; tier: 'cheapest' | 'mid' | 'any'; trust: string; steps: string[]; checks: string[] }`. Reuse `TaskType` and `VerifiabilityLevel` via type-only imports from `classify`/`assess` — no runtime coupling.
- Alternatives: redefine the unions locally (rejected — drift risk; the CLI already validates against them).

**D2. Mapping is a two-stage lookup: level gates, type modulates.**
1. Level → base plan (orchestration + tier + trust), from the docs/mechanics.md §3 table.
2. Type → step-set overrides: `explore`/`open` drop the execute-verify step; `doc`/`feature` pick narrower steps; `bugfix`/`refactor` keep full TDD.
`mapLevel`/`mapType` are pure functions returning partials that a `buildPlan(type, level)` merges in a fixed order.
- Alternatives: one giant `[type][level]` matrix (rejected — 6×4 cells of duplication; two-axis composition is readable and testable).

**D3. CLI `route` branch validates then prints.**
Parse `--type <TaskType>` and `--level <VerifiabilityLevel>`; unknown/missing values → stderr + exit 1 (mirrors `assess` error style). Valid input → single-line output of the plan fields, exit 0.
- Alternatives: multi-line JSON (rejected — heavier than the current CLI's style; nothing consumes JSON yet).

**D4. Step/check lists are static arrays, not generated.**
Each base level and each type override owns a small literal `string[]`. No templating engine, no building strings from data.
- Alternatives: computed step lists (rejected — YAGNI; static data is the whole routing policy at this stage).

## Risks / Trade-offs

- [The docs table is normative but underspecified about step lists] → Mitigation: step lists are additive, consistent with each level's orchestration label, and each is exercised by a spec scenario.
- [Type modulation could contradict level gating] → Mitigation: type only filters the *step list*, never the depth/tier/trust set by level; `buildPlan` applies level first, then type.
- [Plan format could become stale for future stages] → Mitigation: fields are plain strings/arrays; Stages 5–7 may extend fields, which is additive and non-breaking.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Mapping table | 7 Minimum | Static two-axis lookup, pure functions; no rules engine |
| Plan types | 2 Reuse | Type-only imports of `TaskType`/`VerifiabilityLevel` |
| CLI dispatch | 2 Reuse | New `route` branch in existing `src/cli/index.ts` |
| Step/check lists | 7 Minimum | Literal `string[]` constants |
| Output format | 2 Reuse | Single-line, mirrors `classify`/`assess` tab style |
| Tests | 2 Reuse | Table-driven `it.each` corpus, mirrors Stage 1/2 |
