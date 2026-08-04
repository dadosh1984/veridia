## Why

The project has accumulated significant drift between documentation, specs, and code. `docs/mechanics.md` says 5 mechanisms but code has 6. `docs/philosophy.md` claims warpweave scaffolding was dropped but `warpweave/specs/` has 16 files. `README.md` claims "zero runtime dependencies" but AI orchestration uses HTTP. Three specs reference `--agent` flags that don't exist. The CLI spec is missing 7 commands. This incoherence makes the project look unprofessional and confuses contributors.

## What Changes

- **docs/mechanics.md**: Fix mechanism count to 6, add classify to pipeline diagram, remove references to non-existent `intent` artifact
- **docs/philosophy.md**: Remove claim about dropping warpweave scaffolding (it was kept)
- **docs/reuse.md**: Fix `.unified/` status (it IS in source, not gitignored)
- **README.md**: Remove "zero runtime dependencies" claim, add AI orchestration to architecture
- **warpweave/specs/cli/spec.md**: Add missing commands (plan, execute, init, generate, learn, run, triage), remove `--agent` flag references
- **warpweave/specs/classify/spec.md**: Remove `--agent` flag requirement
- **warpweave/specs/ask/spec.md**: Remove `--agent` flag requirement, add decline message for level 2/3
- **warpweave/specs/route/spec.md**: Remove `--agent` flag and `ai-ready` depth requirement
- **warpweave/specs/assess/spec.md**: Fix path format (only `--target`, not positional)

## Capabilities

### Modified Capabilities
- `cli`: Update spec to reflect actual commands; remove `--agent` references
- `classify`: Remove `--agent` flag requirement
- `ask`: Remove `--agent` flag requirement; add decline message behavior
- `route`: Remove `--agent` flag and `ai-ready` depth
- `assess`: Fix path format in spec

## Impact

| Area | Impact |
|------|--------|
| `docs/mechanics.md` | Fix mechanism count, pipeline diagram, remove intent reference |
| `docs/philosophy.md` | Remove scaffolding claim |
| `docs/reuse.md` | Fix .unified/ status |
| `README.md` | Remove zero-deps claim, add AI orchestration |
| `warpweave/specs/cli/spec.md` | Add 7 missing commands, remove --agent |
| `warpweave/specs/classify/spec.md` | Remove --agent |
| `warpweave/specs/ask/spec.md` | Remove --agent, add decline message |
| `warpweave/specs/route/spec.md` | Remove --agent and ai-ready |
| `warpweave/specs/assess/spec.md` | Fix path format |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — docs/specs drift undermines project credibility |
| Existing code reuse? | **Yes** — all content exists, just needs correction |
| Stdlib? | **Yes** — no code changes, only markdown |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
