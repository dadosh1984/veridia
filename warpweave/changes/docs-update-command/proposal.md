## Why

There is no documented way to update veridia. `veridia update` does not exist (veridia has no subcommand for it), and the README/usage docs only cover installation. Users are left guessing how to get the latest release.

## What Changes

- Document **how to update** in the README and `docs/usage.md`: updating is done via npm (`npm update -g veridia` / `npm install -g veridia@latest`), not via a veridia subcommand.
- Clarify that no `veridia update` subcommand exists.

## Capabilities

### New Capabilities
- none (docs/tooling — `skip_specs: true`)

## Impact

| Area | Impact |
|------|--------|
| `README.md` | Add an "Update" section next to Install |
| `docs/usage.md` | Add update step in setup |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — reported gap; users can't find how to update |
| Existing code reuse? | **Yes** — document existing npm mechanism, no new code |
| New dependency? | **No** |

## Complexity

Complexity: **minimal** (docs-only)
