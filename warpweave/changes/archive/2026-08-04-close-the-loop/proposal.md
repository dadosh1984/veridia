## Why

veridia's core thesis is that **quality comes from process, not from the model**. But the current implementation stops halfway: the triage pipeline analyses, classifies, routes, and measures — but never *acts*. The feedback loop described in `docs/verifiability.md` (mutation sensitivity + historical precision) exists only as theory. The ask module generates questions nobody answers. The execute module prints plans nobody runs. The learn module computes stats nothing consumes.

This change closes every open loop, making veridia a complete system that can analyse, decide, act, verify, and improve — all without leaving the CLI.

## What Changes

- **Mutation sensitivity**: Implement the static oracle weighting mechanism from `docs/verifiability.md`. Given a "correct" output, deliberately break it, run each oracle against the broken version, and measure whether the oracle catches the break. Oracle weight = fraction of mutations caught.

- **Historical precision feedback loop**: Make `learn` data consumable by `verify`. After each run, record per-oracle precision (did a PASS predict real correctness?). On subsequent runs, adjust oracle weights by historical precision. Close the loop: learn → verify → measure → learn.

- **Interactive ask mode**: When level is 0/1 and `--auto` is not set, present questions interactively via terminal, collect answers, and feed them into the pipeline (route/execute decisions).

- **AI orchestration (Stage 8)**: Add model-agnostic AI integration. veridia becomes an orchestrator: given a task and a plan, it calls an AI model (via stdio or API), feeds it context, collects output, runs verifiers, and loops on failure. Model-agnostic means pluggable — Claude, GPT, local models via the same interface.

- **Dogfooding**: Add a `veridia run` command that runs the full triage loop on a task and optionally executes it. The project's own `warpweave/changes/` workflow should be runnable through veridia.

## Capabilities

### New Capabilities
- `mutation-sensitivity`: Mechanically measure whether an oracle can distinguish correct from broken output by mutating the output and re-running the oracle
- `historical-precision`: Track per-oracle precision over time and feed it back into oracle weighting
- `interactive-ask`: Present clarifying questions to the user via terminal and collect answers
- `ai-orchestration`: Model-agnostic AI integration — call any model, feed context, collect output, verify, retry
- `dogfooding`: Run the full triage loop on a task and optionally execute it against a target

### Modified Capabilities
*(none — all capabilities are new)*

## Impact

| Area | Impact |
|------|--------|
| `src/verify/` | New `mutate.ts`, `calibrate.ts`; modify `weight.ts`, `verify.ts` |
| `src/learn/` | New `feedback.ts`; modify `learn.ts` to write per-oracle precision |
| `src/ask/` | New `prompt.ts`; modify `ask.ts` for interactive mode |
| `src/execute/` | New `orchestrate.ts`; modify `delegate.ts` for AI calls |
| `src/cli/commands/` | New `run.ts`; modify `ask.ts`, `execute.ts` |
| `src/triage/` | Modify `triage.ts` to wire feedback loop |
| `docs/` | Update `verifiability.md`, `roadmap.md` |
| `package.json` | No new dependencies (stdlib only) |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — these are the core missing pieces that make veridia actually useful. Without them, the project analyses but never acts. |
| Existing code reuse? | **Yes** — `weight.ts` already has static weights, `learn.ts` already computes stats, `ask.ts` already generates questions, `delegate.ts` already has execution infrastructure. We extend these patterns. |
| Stdlib? | **Yes** — `readline` for interactive ask, `crypto` for mutation hashing, `fs` for file operations, `child_process` for AI model calls via stdio |
| Native platform? | **No** — no platform-specific features needed |
| New dependency? | **No** — all can be done with stdlib + existing code |

## Complexity

Complexity: **normal**
