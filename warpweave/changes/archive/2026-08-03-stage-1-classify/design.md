## Context

Stage 0 landed a minimal CLI (`src/cli/index.ts` argv dispatch, `src/cli/version.ts`, in-process test harness). Stage 1 adds mechanism 1 — classify (see proposal.md — Why). The CLI is currently a handful of `if/else` branches (design D2 from Stage 0); `classify` joins that dispatch. No model integration exists and none is wanted in this stage.

## Goals / Non-Goals

**Goals:**
- A deterministic `classify` subcommand with a small, readable rule set.
- A numeric confidence that rewards explicit signals and stays 0–1.
- Corpus-driven unit tests that pin behavior and make future classifier swaps safe.
- Zero new runtime dependencies.

**Non-Goals:**
- No LLM/model-based classification (deferred to a later stage, if ever).
- No probability modeling, TF-IDF, or fuzzy matching.
- No learning/history feedback loop yet (that is mechanism 5, Stage 6).
- No classification of the *repo* — only of the task string.

## Decisions

### D1. Module layout: `src/classify/`
`classify.ts` (pure classifier + types), plus wiring in `src/cli/index.ts` (`classify` branch → `src/classify/` logic). Keeps the pure logic separately testable and out of CLI glue.
*Alternatives:* inline in index.ts — rejected (would grow the CLI file and muddy unit-testing of pure logic).

### D2. Rule table, not a decision tree or library
A list of `{ type, patterns }` entries; score = fraction of the type's patterns matched (or a simpler additive hit count normalized). First pattern group with a hit wins on ties by type priority. Deterministic, ~30 lines, stdlib `String` methods only (rung 7).
*Alternatives:* external NLP/ML lib (rung 5 — rejected: overkill, no dependency policy support), hand-rolled keyword scoring per type (accepted, it is the design).

### D3. Confidence formula: matched-signal ratio
Confidence = matched patterns for the winning type ÷ total patterns considered for it, clamped to [0,1]. Explicit `bugfix` keywords (fix/bug/crash/null) yield higher confidence than generic fallbacks. `open` (fallback) gets a floor confidence (e.g. 0.2) so downstream knows it is a guess.
*Alternatives:* naive 1.0 for any match — rejected (would overstate certainty and defeat mechanism 5's calibration later).

### D4. Output format: one line `type\tconfidence`
Machine-readable single line (`bugfix\t0.83`), so downstream stages and tests parse it trivially. No rich table in this stage.
*Alternatives:* JSON — rejected (premature; a tab line is the one-liner rung 6 for a single value pair).

### D5. Missing-argument handling reuses Stage 0 error path
`veridia classify` with no task → stderr error + non-zero exit, same pattern as Stage 0's unknown-arg handling (design D2/D4 in Stage 0). Multi-word task strings arrive as one `argv` element when quoted; if the user passes multiple tokens, join with spaces before classifying.

### D6. Corpus tests via table-driven vitest cases
`test/classify.test.ts` uses `it.each` over a labeled corpus (one row per spec scenario + extra negative rows), asserting type + confidence bounds + determinism (call twice).
*Alternatives:* snapshot testing — rejected (brittle); separate fixture files — unnecessary at this size.

## Risks / Trade-offs

- [Keyword classifier misfires on ambiguous phrasing] → mitigate by design: `open` fallback + confidence reflects signal strength; corpus tests document expected behavior; swap point isolated behind `src/classify/` when a model arrives.
- [Pattern table grows unmaintainable] → keep patterns per type tiny (≤4 each) and curated; revisit with a model in a later stage.
- [Confidence semantics drift] → pinned by tests (bounds + determinism + floor for `open`).

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| classify subcommand wiring | 2 — Reuse | New branch in existing Stage 0 argv dispatch |
| Classifier logic | 7 — Minimum | Compact pattern/score table; no library |
| Confidence scoring | 6 — One-liner | Normalized matched-signal ratio, clamped [0,1] |
| Output format | 6 — One-liner | Single `type\tconfidence` line |
| Tests | 2 — Reuse | `it.each` corpus, mirrors Stage 0 vitest harness |

## Migration Plan

Not applicable — additive subcommand; Stage 0 CLI behavior unchanged, revert = drop `classify` branch + module.

## Open Questions

None — the corpus contents are implementation detail; tests may extend it without spec or design changes.
