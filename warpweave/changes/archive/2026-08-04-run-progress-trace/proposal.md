## Why

When using veridia from a project, `veridia run <task>` (and the bare `veridia <task>`) print a result only at the END — there is no visibility into the pipeline while it executes. This is a **value problem, not just a UX nicety**: veridia's worth is its deterministic *method* (triage → verifiable steps → measurement), yet if the user cannot see *what and why* it decides at each stage, veridia is indistinguishable from "any LLM returning an answer." Visible progress = visible value: it lets the user feel they are using a high-quality tool running a real, reproducible algorithm.

## What Changes

- Add an optional `progress` callback to the triage options, invoked at each pipeline stage.
- `veridia run <task>` prints a live `→ <stage> <detail>` line per stage, and **each line carries the decision detail / reason** (e.g. the type+confidence, the level and which oracles set it, the chosen depth/tier) — so the user sees veridia's *logic*, not just that a step is "running".
- Progress is presentation-only: the triage result/verdict and JSON outputs are unchanged.

## Capabilities

### New Capabilities
- `run-progress-visibility` (tooling/CLI presentation — `skip_specs: true`)

### Modified Capabilities
- none (output presentation only; triage contract and spec capabilities unchanged)

## Impact

| Area | Impact |
|------|--------|
| `src/triage/triage.ts` | Add optional `progress` option; invoke at each stage |
| `src/cli/commands/run.ts` | Print `→ <stage>` lines via progress to stdout |
| `test/triage.test.ts` | New: progress callback is invoked across stages |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — explicit UX request; silent long runs are a real gap |
| Existing code reuse? | **Yes** — reuse the existing triage stage calls and `run.ts` stdout summary; no new module |
| Stdlib? | **Yes** — plain `process.stdout.write`; no dependency |
| Native platform? | **No** |
| New dependency? | **No** — zero-deps preserved |
| One-liner / minimum? | **Yes** — one optional callback + a few `write` lines |

## Complexity

Complexity: **normal** (adds a public option to the triage API + wires `run` output)

## Deferred / Open Items

- **Per-command md checklist report.** Idea: while resolving a prompt, veridia could write a markdown file per command with a checkbox list of actions, ticking each as it completes. **Decision: not in this change** — live stdout progress is the MVP that validates the "visibility = value" hypothesis without polluting the filesystem. If later needed, prefer a single structured run report (e.g. `.veridia/last-run.md`) that reuses the existing `.veridia/` artifacts rather than many per-command files. Track as a separate change when usage shows stdout alone is insufficient.
