## Why

veridia's triage loop is fully deterministic — it classifies tasks via regex, asks static questions, and runs shell commands. But many tasks require AI: code review, bug detection, architecture analysis, dynamic question generation. veridia should not call AI models directly (no API keys, no HTTP deps). Instead, it should output structured **agent instructions** that any AI agent (Claude, Codex, OpenCode, etc.) can read and execute.

## What Changes

- New `review` subcommand: outputs structured code review instructions for an AI agent (files to scan, patterns to check, output format)
- New `agents --list` subcommand: lists all 33 supported AI agents with config directories and invocation styles
- New `--agent <name>` flag on `classify`, `ask`, and `route`: outputs agent-specific instructions instead of generic output
- New `ai-ready` tier in `route`: when `--agent` is specified, route outputs agent-ready instructions
- All AI interaction is **delegated to the agent** — veridia never calls HTTP, never stores API keys
- veridia remains fully functional without AI (deterministic fallback always works)
- Supported agents: Claude Code, Cursor, OpenCode, Codex CLI, Gemini CLI, GitHub Copilot, Amazon Q, Devin Desktop, Cline, Continue, Kimi Code, and 22 more (full list from warpweave-dev)

## Capabilities

### New Capabilities
- `review`: Output structured code review instructions for an AI agent — specify files, patterns, and output format without calling any model

### Modified Capabilities
- `cli`: Add `review` and `agents` subcommands, `--agent` flag to `classify`, `ask`, and `route`
- `route`: Add `ai-ready` tier option in the run plan
- `classify`: When `--agent` flag is set, output agent instructions instead of regex result
- `ask`: When `--agent` flag is set, output agent instructions for dynamic question generation

## Impact

- New file: `src/agent/agents.ts` — 33 agent definitions
- New file: `src/agent/types.ts` — agent types
- New file: `src/review/review.ts` — code review instruction generator
- New file: `src/review/types.ts` — review types
- New file: `src/util/agent-instruction.ts` — agent instruction helper
- Modified: `src/cli/index.ts` — add `review`, `agents` subcommands, `--agent` flag
- Modified: `src/route/map-level.ts` — add `ai-ready` depth
- Modified: `src/route/types.ts` — add `ai-ready` to `OrchestrationDepth`
- Modified: `src/classify/classify.ts` — add `classifyWithAI` export
- Modified: `src/ask/ask.ts` — add `askWithAI` export
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without AI integration, veridia cannot do code review or deep analysis |
| Existing code reuse? | **Yes** — `triage.ts` pattern reused for `review.ts`; `--ai` flag follows existing `--target` pattern |
| Stdlib? | **Yes** — all output is JSON/plain text, no HTTP, no crypto, no deps |
| Native platform? | **Yes** — Node.js 22+ stdout/stderr for agent communication |
| New dependency? | **No** — zero new dependencies. AI is delegated to the agent |

## Complexity

Complexity: **normal** — new component (review module), modified CLI, modified route/classify/ask
