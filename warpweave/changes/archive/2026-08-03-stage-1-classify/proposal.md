## Why

Stage 0 gave veridia a runnable shell. Stage 1 implements mechanism 1 — Classify:
given a task string, decide what kind of work it is (bugfix/refactor/feature/doc/
explore/open). Classification drives everything downstream: which orchestration
template, how much verifiability matters, and which model tier is sufficient.
Deterministic heuristics first, weak-model backup later.

## What Changes

- New `classify` subcommand: `veridia classify "<task>"` returns a task type + confidence.
- Task type taxonomy: `bugfix`, `refactor`, `feature`, `doc`, `explore`, `open` (fallback).
- Deterministic, keyword/pattern-based classifier with a confidence score; no network, no model call in this stage.
- Unit-tested against a small labeled corpus (deterministic core — per roadmap, early stages need no external AI).
- **BREAKING**: none — Stage 1 only adds a subcommand to the existing CLI.

## Capabilities

### New Capabilities
- `classify`: the veridia `classify` subcommand — accepts a task string, returns a type + confidence, deterministically.

### Modified Capabilities

<!-- None — the existing `cli` capability's behavior (help/version/exit codes) is unchanged; `classify` is additive. -->

## Impact

- New source: `src/classify/` (classifier + confidence), a subcommand wired into `src/cli/index.ts`.
- New tests: `test/classify.test.ts` (corpus-driven).
- Existing `src/cli/index.ts` arg dispatch extended to recognize `classify`.
- No runtime dependencies added (stdlib string matching).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — classify is the first mechanism and everything later routes off it. Scope held to deterministic core: no model call, no external corpus, no fuzzy NLP. |
| Existing code reuse? | Reuse Stage 0 CLI skeleton: `classify` is a new branch in the existing argv dispatch + a new module under `src/`. |
| Stdlib? | Yes — regex/keyword matching on the task string with `String.prototype` (includes, match); confidence as a simple score. |
| Native platform? | No platform feature applies (pure in-process string classification). |
| New dependency? | No runtime dependency. A scoring/classification library would be over-engineering (rung 7: a compact rule table suffices); model-based classification is deferred to a later stage. |

## Complexity

Complexity: **normal** — new component (`src/classify/`), new public subcommand, 4+ files. Full chain: proposal → specs → design → tasks.
