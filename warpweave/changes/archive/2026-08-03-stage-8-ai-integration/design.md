## Context

See proposal.md — Why. veridia currently outputs tab-delimited text for human consumption. AI agents need structured instructions. The warpweave-dev ecosystem supports **33 AI agents** (Claude Code, Cursor, OpenCode, Codex, Gemini CLI, GitHub Copilot, etc.) through tool-specific config directories (`.claude/`, `.cursor/`, `.opencode/`, etc.). veridia should output instructions in the format each agent expects, and optionally generate agent config files directly.

## Goals / Non-Goals

**Goals:**
- `veridia review --target .` outputs structured code review instructions for any AI agent
- `veridia classify --ai "task"` outputs JSON agent instructions instead of regex result
- `veridia ask --ai --type feature --level 1` outputs JSON for dynamic question generation
- `veridia route --type feature --level 3 --ai` includes `ai-ready` depth
- `veridia generate --agent claude` generates agent config files (skills + commands) for a specific agent
- `--agent <name>` flag on all commands to specify target agent (default: generic JSON)
- Zero new runtime dependencies — AI is always delegated to the agent

**Non-Goals:**
- No HTTP calls, no API keys, no model clients
- No changes to deterministic behavior (without `--ai`, everything works as before)
- No breaking changes to existing output format

## Supported Agents (from warpweave-dev)

veridia supports the same 33 agents as warpweave-dev. Each has a unique ID and config directory:

| Agent ID | Name | Config Dir | Invocation |
|----------|------|-----------|------------|
| `claude` | Claude Code | `.claude/commands/ww/` | `/ww:<id>` |
| `cursor` | Cursor | `.cursor/commands/` | `/ww-<id>` |
| `opencode` | OpenCode | `.opencode/commands/` | `/ww-<id>` |
| `codex` | Codex CLI | `.codex/skills/` | `$warpweave-<skill>` |
| `gemini` | Gemini CLI | `.gemini/commands/ww/` | `/ww:<id>` |
| `github-copilot` | GitHub Copilot | `.github/prompts/` | `/ww-<id>` |
| `amazon-q` | Amazon Q | `.amazonq/prompts/` | `@ww-<id>` |
| `devin` | Devin Desktop | `.devin/workflows/` | `/ww-<id>` |
| `cline` | Cline | `.clinerules/workflows/` | `/ww-<id>` |
| `continue` | Continue | `.continue/prompts/` | `/ww-<id>` |
| `kimi` | Kimi Code | `.kimi-code/` | `/skill:warpweave-<skill>` |
| ... and 22 more | | | |

Full list: `veridia agents --list`

## Decisions

1. **`--agent <name>` flag** — Specifies which agent to target. Output format adapts to the agent's expected input (JSON for generic, tool-specific files for direct integration). Default: generic JSON.

2. **`veridia agents --list`** — Lists all 33 supported agents with their config directories and invocation styles.

3. **`veridia generate --agent <name>`** — Generates agent config files (skills + commands) in the agent's config directory, following the same pattern as `warpweave init`. This is the bridge between veridia's analysis and the agent's tooling.

4. **JSON output for agent instructions** — When `--agent` is not specified or the agent is generic, outputs JSON with `instruction`, `context`, and `expectedOutput` fields. The agent parses this and executes.

5. **`review` as a new subcommand** — Code review is a distinct capability not covered by existing commands. It needs its own module.

6. **`ai-ready` depth in route** — The existing `depth` field (`full-tdd`, `minimal`, etc.) gets a new value `ai-ready`. The `tier` field maps to model suggestions (`cheapest` → fast model, `mid` → balanced, `any` → best available).

7. **Agent instruction format** — Each JSON output includes:
   - `instruction`: what the agent should do
   - `context`: files, patterns, or data the agent needs
   - `expectedOutput`: what the agent should return
   - `agent`: target agent info (if `--agent` specified)

## Risks / Trade-offs

- [Risk] Agents may not parse JSON correctly → Mitigation: JSON is the most portable format; fallback to plain text if JSON parsing fails
- [Risk] `--ai` flag proliferation → Mitigation: only 3 commands get it (classify, ask, route); review and generate always output agent instructions
- [Risk] Agent config directories change → Mitigation: agent definitions are in a single source file, easy to update

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Agent definitions | 2 (Reuse) | Same 33 agents as warpweave-dev |
| Agent instruction format | 3 (Stdlib) | `JSON.stringify` — no dependency |
| `--agent` flag pattern | 2 (Reuse) | Same `--target`/`--type` flag pattern |
| `review` module | 2 (Reuse) | Same `types.ts` + `review.ts` pattern as `measure/` |
| `generate` subcommand | 2 (Reuse) | Same file-generation pattern as warpweave init |
| `ai-ready` depth | 2 (Reuse) | New value in existing `OrchestrationDepth` union |
