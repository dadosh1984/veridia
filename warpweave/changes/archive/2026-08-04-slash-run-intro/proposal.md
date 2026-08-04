## Why

`veridia init`/`generate` produces 11 slash commands, but the **primary human command `veridia run` is missing** — `/veridia-run` does not exist, and there is no onboarding command. Also the step-by-step (`session-*`) flow and an intro are absent from the generated command set, so the slash-command set is not a faithful mirror of the CLI and the two coherent usage paths (one-shot `run` vs step-by-step `session-*`) are incomplete.

## What Changes

- Add **`run`** command: `veridia run <task>` — the full triage loop with live `→` progress and a human-readable summary.
- Add **`intro`** command: explains how to use veridia (docs/usage.md summary).
- Add **`session-*`** commands (`session-classify`, `session-assess`, `session-route`, `session-ask`, `session-do`, `session-status`, `session-archive`) so the step-by-step pipeline is reachable as slash commands too.
- Add a **`skills/veridia-intro/SKILL.md`** so the agent can explain onboarding.

Generated command count goes 11 → 20. The set then mirrors the CLI exactly, with coherent logic:
`intro` (orient) → `run`/`triage` (one-shot full loop) or `session-*` (step-by-step) + `classify/assess/route/...` (building blocks).

## Capabilities

### New Capabilities
- none (tooling / CLI command generation — `skip_specs: true`)

## Impact

| Area | Impact |
|------|--------|
| `src/generate/adapters.ts` | Add `run`, `intro`, and 7 `session-*` commands |
| `skills/veridia-intro/SKILL.md` | New onboarding skill |
| `test/generate.test.ts` | Update command count (11 → 20) + presence asserts |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — `run` is the primary command and is missing from slash commands |
| Existing code reuse? | **Yes** — add entries to the existing `COMMANDS` list + copy skill pattern |
| Stdlib? | **Yes** — no new dep |
| New dependency? | **No** |

## Complexity

Complexity: **normal** (extends command table + a few files)
