## Context

- See proposal.md - Why for motivation; specs/ask/spec.md for the behavior contract.
- Existing code: `src/classify/types.ts` exports `TaskType`; `src/assess/types.ts` exports `VerifiabilityLevel`; `src/cli/index.ts` is a flat argv dispatcher with `classify`/`assess`/`route` branches. `route` already emits an `ask` step for level 0/1 — this stage provides what that step executes.
- Source of truth: docs/roadmap.md §Stage 4 ("2–3 short clarifying questions, multiple choice; user may answer or say 'defaults'") and docs/verifiability.md consequence matrix (level 0 → "ask expectation", level 1 → "2–3 questions").
- Constraints (AGENTS.md): TDD; stdlib only; deterministic output; build = `pnpm build`, tests boot compiled `dist/cli/index.js`.

## Goals / Non-Goals

**Goals:**
- A `src/ask/` module with a static question bank keyed by task type, plus a selector that picks the 2–3 questions to emit per `(type, level)`.
- Level gating: 0/1 → emit questions; 2/3 → decline with a short message.
- CLI branch `ask` validating `--type`/`--level` and printing questions or the decline.

**Non-Goals:**
- Adaptive/model-driven questioning, answer persistence, or piping answers forward (Stage 7).
- Reading real user input interactively — `ask` prints questions; collecting answers is a later stage.
- Generating questions by AI — static bank only.

## Decisions

**D1. Types live in `src/ask/types.ts`.**
`ClarifyingQuestion { id: string; prompt: string; options: string[] }`. `AskResult { questions: ClarifyingQuestion[] }`, plus a decline path. Reuse `TaskType`/`VerifiabilityLevel` via type-only imports.
- Alternatives: redefine unions locally (rejected — drift risk).

**D2. Question bank is a static record keyed by task type.**
Each `TaskType` owns an array of question templates. Templates are level-aware where docs require: level 0 injects an "expected outcome" question, level 1 uses the type's standard set. The selector `selectQuestions(type, level)` returns the deterministic subset (2–3 items).
- Alternatives: one global pool with arbitrary picking (rejected — non-deterministic ordering); per-`(type,level)` matrices (rejected — 6×4 duplication).

**D3. Level gate is a pure function.**
`level === 0 || level === 1` → return questions; otherwise return the decline. Mirrors `route`'s `mapLevel` style — a small switch, no engine.
- Alternatives: folding the gate into the selector (rejected — separation keeps the decline path trivial to test).

**D4. CLI `ask` branch validates then prints.**
Parse `--type <TaskType>` and `--level <VerifiabilityLevel>`; missing/invalid → stderr + exit 1 (mirrors `route`). Valid + 0/1 → one block per question (`id\tprompt\topt1|opt2|...`), exit 0. Valid + 2/3 → single decline line, exit 0.
- Alternatives: JSON/multi-line prose (rejected — heavier than the current tab-style CLI; the tab block is parseable and testable).

**D5. `defaults` contract deferred, but honored in wording.**
Spec says the user "may answer or say defaults". Answer collection is Stage 7; the question bank still orders the default (first option) so `defaults` is well-defined later.
- Alternatives: implementing interactive answer collection now (rejected — YAGNI; `ask` only produces questions this stage).

## Risks / Trade-offs

- [Static bank could feel generic per type] → Mitigation: 2–3 questions each, grounded in the type's failure modes (e.g. bugfix asks for the failing input/repro, feature asks for acceptance criteria); no model means no surprises.
- [Decline message for 2/3 could be confused with an error] → Mitigation: exit 0 and a positive message ("no clarifying questions needed"); spec scenario covers it.
- [Question text drift vs later stages] → Mitigation: `id` is stable and part of the contract; text can evolve without breaking consumption.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Question bank | 7 Minimum | Static per-type template arrays; no rules engine |
| Selector/gate | 7 Minimum | Small pure functions; deterministic subsetting |
| Plan types | 2 Reuse | Type-only imports of `TaskType`/`VerifiabilityLevel` |
| CLI dispatch | 2 Reuse | New `ask` branch in existing `src/cli/index.ts` |
| Output format | 2 Reuse | Tab-delimited blocks, mirrors `classify`/`assess`/`route` |
| Tests | 2 Reuse | Table-driven `it.each` corpus, mirrors Stage 1–3 |
