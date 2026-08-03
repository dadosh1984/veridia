## Why

AI agents (Claude Code, Cursor, OpenCode) don't know how to use veridia. Without SKILL.md files, each agent must be manually told the command syntax. Warpweave-dev has 27 skills that agents auto-discover.

## What Changes

- Create `skills/` directory with SKILL.md for each veridia command
- Each SKILL.md follows the warpweave pattern: YAML frontmatter + description + usage + JSON output format
- Commands: classify, assess, route, ask, plan, execute, verify, measure, review, agents, init, generate, triage

## Capabilities

### New Capabilities
- `skill-files`: SKILL.md files for AI agent auto-discovery

### Modified Capabilities
- (none)

## Impact

- `skills/veridia-<command>/SKILL.md` — 13 new files
- No changes to source code

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without skills, agents can't use veridia |
| Existing code reuse? | **Yes** — pattern from warpweave-dev skills |
| Stdlib? | **Yes** — markdown files |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
