## Why

For level 0/1 tasks, `ask()` always returns questions. The pipeline blocks waiting for human input. No `--auto` flag means veridia cannot run in CI/CD or unattended mode.

## What Changes

- Add `--auto` / `--non-interactive` / `--yes` flag to CLI
- When `--auto` is set, `ask()` returns empty questions + records assumptions
- Assumptions are written to `.veridia/assumptions.jsonl` for later review
- Default mode (without `--auto`) is unchanged

## Capabilities

### New Capabilities
- (none — enhancement to existing ask)

### Modified Capabilities
- `ask`: REQUIREMENT changed — now supports `--auto` mode

## Impact

- `src/ask/ask.ts` — accept `auto` option, return empty questions
- `src/triage/triage.ts` — pass `auto` from options
- `src/cli/index.ts` — add `--auto` flag parsing
- `src/ask/select.ts` — record assumptions when auto

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without auto mode, CI/CD is impossible |
| Existing code reuse? | **Yes** — `ask()` already exists |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
