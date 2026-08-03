## Context

See proposal.md — Why. veridia must become agent-first: JSON output by default, tool-specific command files in the agent's config directory, and a `.veridia/config.json` for user configuration. The warpweave-dev project generates `.claude/commands/ww/<id>.md` files — veridia will generate `.claude/commands/veridia/<id>.md` (using its own namespace).

## Goals / Non-Goals

**Goals:**
- All commands output JSON by default (tab-separated text removed)
- `veridia init --agent claude` creates `.veridia/config.json` + `.claude/commands/veridia/`
- `veridia generate --agent claude` generates command files for the agent
- Command files use `veridia/` namespace: `.claude/commands/veridia/classify.md`
- `.veridia/config.json` loads patterns, probes, workflows from config

**Non-Goals:**
- No changes to existing command behavior (same logic, different output format)
- No new dependencies
- No AI model calls

## Decisions

1. **JSON output by default** — All commands output JSON. The `--json` flag is removed (it's the default). A `--text` flag can be added later if needed.

2. **`veridia/` namespace** — Agent command files use `veridia/` instead of `ww/`. This is veridia's own namespace, not borrowed from warpweave.

3. **Adapter pattern** — Each agent has an adapter that knows the file path and format. Same pattern as warpweave-dev but simplified.

4. **`.veridia/config.json`** — Optional config file. If it exists, its values override hardcoded defaults. If not, hardcoded defaults are used.

5. **`init` vs `generate`** — `init` is for first-time setup (creates config + agent files). `generate` is for updating agent files after config changes.

## Agent Command File Structure

```
.claude/commands/veridia/
├── classify.md
├── assess.md
├── route.md
├── ask.md
├── verify.md
├── measure.md
├── review.md
├── agents.md
└── triage.md

.opencode/commands/
├── veridia-classify.md
├── veridia-assess.md
├── veridia-route.md
├── veridia-ask.md
├── veridia-verify.md
├── veridia-measure.md
├── veridia-review.md
├── veridia-agents.md
└── veridia-triage.md
```

## Risks / Trade-offs

- [Risk] Breaking change: existing scripts that parse tab-separated output will break → Mitigation: JSON is more parseable; scripts should use `jq` or `JSON.parse`
- [Risk] Agent config directories may not exist → Mitigation: `init` creates them; `generate` warns if they don't exist

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| JSON output | 3 (Stdlib) | `JSON.stringify` — no dependency |
| Config loader | 3 (Stdlib) | `readFileSync` + `JSON.parse` |
| Agent adapters | 2 (Reuse) | Same pattern as warpweave-dev |
| `veridia/` namespace | 4 (Native) | Our own convention, not borrowed |
