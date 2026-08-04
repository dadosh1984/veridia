## Why

`veridia init --agent opencode` already generates agent command files, and `getAllAgents()` knows 35 AI agents — but the user must know the exact `--agent <id>` to type, and each agent is set up one at a time. There is no discovery (which agent is already installed?) and no place to install the bundled `skills/veridia-*` skills, so `skillsOnly` agents (codex, kimi, vibe, ...) get nothing useful. We want `veridia init` to work for **every** configured agent:

- interactively select **several** agents at once (checkbox multi-select over all 35),
- pre-select agents whose config directories are already present in the target,
- generate **commands** for command-capable agents AND install **skills** for every selected agent.

## What Changes

- **Interactive multi-select prompt** (`node:readline`-based, zero deps) listing all `getAllAgents()` with checkboxes, arrow keys, Enter to confirm; pre-selected when `fs.existsSync('<target>/<configDir>')`.
- **Interactive guard**: prompt only when `process.stdin.isTTY`, `CI` is absent, and no `--no-interactive`/env disable; otherwise fall back to `--agent <id>` (existing) or error listing valid ids.
- **Skill installation**: `installSkills(agent, target)` copies the bundled `skills/veridia-*` into `<target>/<configDir>/skills/`.
- **Per-agent delivery** in `init`: command-capable agents get command files (existing adapters); *all* selected agents get skills.

## Capabilities

### New Capabilities (tooling — `skip_specs: true`)
- **Agent discovery & multi-select setup**: interactive `veridia init` for any/all of the 35 agents.

## Impact

| Area | Impact |
|------|--------|
| `src/prompts/checkbox-select.ts` (new) | Zero-dep checkbox multi-select on `node:readline` |
| `src/utils/interactive.ts` (new) | TTY/CI/flag interactive guard |
| `src/generate/skills.ts` (new) | `installSkills(agent, target)` copy bundled `skills/veridia-*` |
| `src/cli/commands/init.ts` | Interactive picker + per-agent delivery (commands + skills) |
| `src/agent/agents.ts` | Expose `skillsOnly`/capability to pick delivery (already present) |
| `test/` | New tests for picker guard, multi-select behavior, skill install |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — explicit multi-select + skills requirement |
| Existing code reuse? | **Yes** — `getAllAgents()`, existing adapters, `node:readline` already used in `ask/prompt.ts` |
| Stdlib? | **Yes** — `node:readline` raw-mode checkbox (no new dep) |
| Native platform? | **No** |
| New dependency (`@inquirer`)? | **No** — violates the project's zero-runtime-deps rule |
| Skill delivery? | **Yes** — reuse the already-shipped `skills/veridia-*` assets |

## Notes / Open Items

- Picker stays **stdlib**: a compact raw-mode checkbox renderer, not `@inquirer` (project commandment: no runtime deps).
- `.agents/skills/` and `.claude/skills/` are universal skill locations opencode also reads; the natural default is `<configDir>/skills/` per agent.
- `generate` command may reuse the picker later; initial scope is `init`.
