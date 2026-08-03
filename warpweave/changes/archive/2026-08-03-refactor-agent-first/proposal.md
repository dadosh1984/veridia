## Why

veridia currently outputs tab-separated text for humans and has a separate `--agent` flag for JSON. AI agents (Claude, OpenCode, Cursor, etc.) need JSON by default and tool-specific config files to discover veridia's commands. The warpweave-dev project already solves this pattern: it generates skill/command files in agent directories (`.claude/commands/`, `.opencode/commands/`). veridia should follow the same pattern but use its own `veridia/` namespace instead of `ww/`.

## What Changes

- **BREAKING**: All CLI commands output JSON by default (tab-separated text removed)
- New `veridia init --agent <name>`: initializes `.veridia/config.json` and generates agent config files
- New `veridia generate --agent <name>`: generates command files in the agent's config directory using `veridia/` namespace
- New `.veridia/config.json`: configuration file for patterns, probes, workflows (replaces hardcoded values)
- Agent command files use `veridia/` namespace: `.claude/commands/veridia/classify.md`, `.opencode/commands/veridia-classify.md`
- All existing commands remain functional but output JSON

## Capabilities

No new capabilities — pure refactor. No spec-level behavior changes.

## Impact

- New file: `src/generate/generate.ts` — agent command file generator
- New file: `src/generate/adapters.ts` — tool-specific adapters (claude, opencode, cursor)
- New file: `src/config/config.ts` — `.veridia/config.json` loader
- Modified: `src/cli/index.ts` — JSON output by default, add `init` and `generate` subcommands
- Modified: `src/classify/classify.ts` — load patterns from config
- Modified: `src/assess/probe.ts` — load probes from config
- Modified: `src/route/map-level.ts` — load model tiers from config
- Modified: `src/route/map-type.ts` — load workflow steps from config
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without JSON output and agent integration, veridia is unusable by AI agents |
| Existing code reuse? | **Yes** — adapter pattern from warpweave-dev, config pattern from many CLI tools |
| Stdlib? | **Yes** — `JSON.stringify`, `node:fs` for config loading |
| Native platform? | **Yes** — Node.js 22+ |
| New dependency? | **No** — zero new dependencies |

## Complexity

Complexity: **normal** — touches 8+ files, breaking output format change, new init/generate system
