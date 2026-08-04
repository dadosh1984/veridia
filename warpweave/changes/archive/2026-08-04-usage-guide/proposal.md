## Why

There is no practical, user-facing guide for applying veridia. Users/new projects don't know the first command to run, how the pipeline sequence works, or how to drive veridia from an AI-agent chat (like OpenCode). The docs explain the *design* (mechanics, verifiability) but not *how to use it day-to-day*. This change adds a `docs/usage.md` practical guide and links it from the README.

## What Changes

- Add `docs/usage.md`: a beginner-friendly guide covering
  - the mental model (`veridia run` = one command for the whole pipeline),
  - one-time setup (`npm i -g veridia; veridia init`),
  - how to run tasks from an agent chat (command + `/veridia-run ...` + visible `→` progress),
  - when to use one-shot vs step-by-step (session-*),
  - a reference table of all commands.
- Add a "How to use" link to the README's docs index.

## Capabilities

### New Capabilities
- none (docs/tooling only — `skip_specs: true`)

## Impact

| Area | Impact |
|------|--------|
| `docs/usage.md` | New practical usage guide |
| `README.md` | Add usage guide to docs index |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — no usage docs exist; this is the #1 onboarding gap |
| Existing code reuse? | **Yes** — document existing commands/skills, no new code |
| Stdlib / dependency? | **No** — pure documentation |
| New capability? | **No** |

## Complexity

Complexity: **minimal** (docs-only, ≤2 files)
