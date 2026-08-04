## Why

After the fix to `veridia init`, the interactive picker still ends by printing a raw JSON blob (`{"initialized":true,"agents":[...commandsGenerated...]}`). For a human using the picker that is noise; JSON is only useful when scripts/agents drive init. We want human-readable output in the interactive path, keeping JSON for the non-interactive (`--agent`) path.

## What Changes

- In `src/cli/commands/init.ts`, track whether the interactive picker path was used.
  - **Interactive (picker) path** → print a short human-readable summary (agent counts, config path).
  - **Non-interactive (`--agent <id>`) path** → keep the JSON output unchanged (for scripts/agents).
- Extract the summary formatting into a pure `formatInitSummary(setup)` so it is unit-testable.

## Capabilities

### New Capabilities (tooling — `skip_specs: true`)
- **Human-readable interactive init output** (JSON stays for non-interactive).

## Impact

| Area | Impact |
|------|--------|
| `src/cli/commands/init.ts` | Branch output by interactive flag; add `formatInitSummary` |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — explicit UX request |
| Existing code reuse? | **Yes** — reuse `setup` shape; add a pure formatter |
| New dependency? | **No** |

## Notes / Open Items

- Only the interactive path changes; `--agent` continues to emit JSON.
