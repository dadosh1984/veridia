## Why

All six mechanisms (classify, assess, route, ask, verify, measure) are implemented as standalone subcommands, but there is no end-to-end `veridia <task>` command that runs the full triage loop. The README still says "Nothing implemented yet." The project needs integration, documentation, and polish before it is usable as a single tool.

## What Changes

- New `veridia <task>` end-to-end command: runs classify → assess → route → ask? → verify → measure in one invocation
- Update README.md with current status, usage examples, and architecture overview
- Update `--help` output to document the end-to-end command
- Polish CLI output formatting for consistency
- No new runtime dependencies

## Capabilities

### New Capabilities
- `triage`: Run the full triage loop (classify → assess → route → ask? → verify → measure) on a task string in one command

### Modified Capabilities
- `cli`: Add `veridia <task>` end-to-end mode to the CLI dispatcher; update `--help` and README

## Impact

- New file: `src/triage/triage.ts` — orchestrator that chains all 6 mechanisms
- Modified: `src/cli/index.ts` — add end-to-end branch
- Modified: `README.md` — update status and add usage docs
- Zero new runtime dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without end-to-end, veridia is 6 unconnected tools, not a product |
| Existing code reuse? | **Yes** — all 6 mechanisms already exist; triage.ts just chains them |
| Stdlib? | **Yes** — no new imports beyond what the mechanisms already use |
| Native platform? | **Yes** — Node.js 22+ runs the chain natively |
| New dependency? | **No** — zero new dependencies |

## Complexity

Complexity: **normal** — new component (triage orchestrator), modified CLI, documentation update
