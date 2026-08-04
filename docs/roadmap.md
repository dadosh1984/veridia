# Roadmap — eat the elephant piece by piece

## Development process (decided)

**Variant B — own ideas only.** No OpenSpec/warpweave ceremony, no copying of its
`task/apply/archive` lifecycle. We **dogfood veridia's own lightweight triage loop**
(`assess → route → ask? → do → verify → measure`) to build veridia itself.
Ideas are allowed to evolve *during* implementation — this is not a heavy
upfront-spec project. Specs/docs are a note-taking layer, not a hard gate.

Each stage is small, independently valuable, and ends with something testable.
We **never** build a stage before the previous one holds (and per our own method,
we spec + verify each before moving on).

## Stage 0 — Foundations (shape)
- Create repo `veridia` (release GitHub + npm name).
- Set up from [reuse.md](reuse.md): copy generic infra, re-author method, copy **no** `src/`.
- `package.json`, TypeScript + ESM, CLI skeleton (single command `veridia`).
- `veridia --help`, `veridia version`.
- CI scaffold (lint → tsc → build → test), Windows/macOS/Linux matrices.
- **Definition of done:** clean environment, `--help` works, tests green.

## Stage 1 — Classify (mechanism 1)
- Given a task string, classify type (bugfix/refactor/feature/doc/explore/open).
- Heuristics first, weak-model backup. Deterministic, unit-tested on corpus.
- **Done:** a `classify` command returns a type + confidence.

## Stage 2 — Assess verifiability (mechanism 2, the crux)
- Probe a target directory/repo: detect test runner, tests touching files, CI,
  type-check, lint. Map to level 0–3.
- **Done:** `assess --target <path>` returns verifiability level + oracle list.

## Stage 3 — Route (mechanism 3)
- Map (task type, verifiability level) → (orchestration depth, model tier).
- Emit a run plan (which steps, which checks). **Done:** `route` prints a plan.

## Stage 4 — Ask (honest triage)
- When level is 0/1, generate 2–3 short clarifying questions (multiple choice).
- **Done:** `ask` produces questions; user may answer or say "defaults".

## Stage 5 — Execute + Verify (mechanism 4)
- Run the planned steps; run + **weigh** the verifier; gate on it.
- Guard against verifiability theater (weight by meaning capture).
- **Done:** a task goes assess→route→ask→do→verify with a verdict.

## Stage 6 — Measure / learn (mechanism 5)
- Record drift vs expectations, token/cost per phase, outcome.
- Accumulate into a local history; surface trends.
- **Done:** after N runs we can answer "did we overpay / misjudge, and how."

## Stage 7 — Integration & polish
- Wire full loop; `veridia <task>` end-to-end; docs; names/packaging.
- Decide on skills.sh distribution (portable skills over the ecosystem).

## Stage 8 — AI integration & feedback loops (in progress)
- **Mutation sensitivity**: String-level mutation engine measures oracle meaning-capture. ✓
- **Historical precision**: Per-oracle precision tracked over time, fed back into verify. ✓
- **Interactive ask**: Terminal-based question prompts with answer collection. ✓
- **AI orchestration**: Model-agnostic call interface (stdio + HTTP), context assembly, retry loop. ✓
- **Dogfooding**: `veridia run` command with `--self`, `--ww`, `--change` flags. ✓
- **Remaining**: Full end-to-end dogfooding of veridia through veridia; streaming output; logging.

## Cross-cutting notes
- Status file, knowledge graph of idea decisions: `docs/` is the source of truth.
- Each stage: spec → implement → verify → commit (our own doctrine, dogfooded).
- No external AI models required to develop the early stages (deterministic core).
