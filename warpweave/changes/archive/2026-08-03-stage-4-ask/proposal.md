## Why

Stages 1–3 classify, assess, and route. But when verifiability is 0/1 — no mechanical oracle, only a human can judge — the plan must not guess: it must **ask**. This is the "ask?" in `assess → route → ask? → do → verify → measure` (docs/roadmap.md §7, docs/verifiability.md consequence matrix rows 0/1). Asking 2–3 short multiple-choice questions before executing turns an unverifiable task into one with an explicit, human-owned contract. This is also the honesty floor: we refuse to fake verifiability we don't have.

## What Changes

- New `ask` subcommand: `veridia ask --type <type> --level <level>` prints 2–3 clarifying multiple-choice questions.
- Only meaningful at level 0/1 (the rows whose process includes "ask humans"); at level 2/3 the command SHALL decline with a message (no questions needed — a mechanical oracle exists).
- Questions are **deterministic and template-driven**: derived from task type (`bugfix` | `refactor` | `feature` | `doc` | `explore` | `open`) plus the verifiability row (level 0 → "ask expectation", level 1 → "2–3 questions"). No model calls — the question bank is static data, mirroring how `route`'s mapping is static policy.
- Each question carries options (multiple choice) and a stable id, so the user can answer each or say `defaults` (accept the first/expected option).
- Output format: one question per block, machine-parseable (matches the tab-style precedent of `classify`/`assess`/`route`).
- **BREAKING**: none — additive subcommand.

## Capabilities

### New Capabilities
- `ask`: the veridia `ask` subcommand — emits 2–3 deterministic multiple-choice clarifying questions for level 0/1 tasks, or declines when a mechanical oracle exists.

### Modified Capabilities

<!-- None — `cli`, `classify`, `assess`, `route` behavior unchanged; `ask` is additive. -->

## Impact

- New source: `src/ask/` (question bank + selector), wired into `src/cli/index.ts`.
- New tests: `test/ask.test.ts` (table-driven corpus).
- Existing CLI arg dispatch gains an `ask` branch; existing behavior untouched.
- No runtime dependencies (static data + stdlib).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — ask is the honesty gate between route and execute; mechanism exists in the roadmap and docs. Scope held to deterministic template questions: no adaptive/model-driven questioning (that would need a model), no persistence of answers (Stage 7). |
| Existing code reuse? | Reuse Stage 1 `TaskType`, Stage 2 `VerifiabilityLevel`, Stage 0 CLI dispatch; module layout mirrors `src/route/`. |
| Stdlib? | Yes — pure function + static question table, no I/O beyond argv parsing. |
| Native platform? | N/A — no filesystem/network. |
| New dependency? | No. A prompt/LLM library would contradict the deterministic core (rung 7: static bank + selector suffices). |

## Complexity

Complexity: **normal** — new component (`src/ask/`), new public subcommand, table-driven tests.
