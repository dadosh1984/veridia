## Why

The project contains files from other projects (warpweave, superpowers, ponytail, rtk) that are not part of veridia. Specifically:
- `.unified/config/` contains warpweave-unified configuration files
- `skills/veridia-*/SKILL.md` files use a template format copied from warpweave-dev (`allowed-tools: Bash(veridia:*)`)

These are not generic boilerplate — they are recognizable artifacts from other projects. Removing/rewriting them makes veridia fully original.

## What Changes

- **Remove `.unified/config/`** — delete `pipeline.yaml` and `unified.toml` (warpweave configs, not used by veridia)
- **Rewrite `skills/veridia-*/SKILL.md`** — replace `allowed-tools: Bash(veridia:*)` with `allowed-tools: Bash` (generic), remove warpweave-specific metadata format, keep content original
- **Update `docs/reuse.md`** — correct `.unified/` status (it was in source, now removed)

## Capabilities

No spec-level behavior changes — pure refactoring.

## Impact

| Area | Impact |
|------|--------|
| `.unified/config/pipeline.yaml` | Delete |
| `.unified/config/unified.toml` | Delete |
| `skills/veridia-*/SKILL.md` (20 files) | Rewrite frontmatter format |
| `docs/reuse.md` | Update `.unified/` reference |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — foreign artifacts undermine project originality |
| Existing code reuse? | **N/A** — removal, not addition |
| Stdlib? | **N/A** |
| Native platform? | **N/A** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
