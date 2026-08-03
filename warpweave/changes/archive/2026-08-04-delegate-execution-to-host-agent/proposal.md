## Why

veridia has a fundamental gap: it classifies, assesses, routes, asks, and verifies — but never **executes**. The "do" step from the documented loop (`assess → route → ask? → do → verify → measure`) is missing. Meanwhile, veridia maintains a static list of 35 AI agents but never calls any of them. The `--agent` flag generates JSON instructions that go nowhere.

The solution: veridia should not call external models at all. Instead, it delegates execution to the **host AI agent** — the tool that invoked veridia (Claude Code, Cursor, OpenCode, etc.). The host agent IS the execution engine. veridia becomes a pure triage + verification layer that outputs structured instructions for the host to follow.

This aligns with the core philosophy: "quality is a property of the process, not of the model." veridia provides the process; the host agent provides the execution.

## What Changes

- **New `plan` command**: Outputs a structured execution plan (steps, files, commands) for the host agent to execute, replacing the current `--agent` JSON formatting
- **New `execute` command**: Runs the "do" step by feeding the plan to the host agent via its native invocation mechanism (CLI commands, file writes, or structured output)
- **Modified `triage` command**: Wires the "do" step into the full loop: `assess → route → ask? → do (delegate to host) → verify → measure`
- **Modified `verify` command**: Accepts a target path after execution to verify the host agent's output
- **Removed `--agent` flag from classify/route/ask**: No longer generates dead-end JSON; agent awareness moves to the new `execute` command
- **Agent list becomes a routing table**: Maps agent capabilities (can it write files? run shell commands? call models?) to execution strategy, not just invocation style

## Capabilities

### New Capabilities
- `plan-execution`: Generate structured execution plans from route output — steps, files to modify, commands to run, checks to pass
- `host-agent-delegation`: Delegate plan execution to the host AI agent via its native protocol (CLI, file-based instructions, structured output)
- `post-execution-verify`: Run verification against the host agent's output after execution completes

### Modified Capabilities
- (none — no existing specs to modify)

## Impact

- `src/cli/index.ts` — new `plan` and `execute` subcommands; modified `triage` to include "do" step
- `src/agent/` — agents.ts becomes a routing table with capability detection; types.ts extended
- `src/execute/` — new module: plan builder + host agent delegator
- `src/triage/triage.ts` — wire "do" step into the loop
- `src/verify/verify.ts` — accept post-execution target for verification
- `src/generate/` — adapters.ts updated for new command structure
- No new runtime dependencies (stdlib only: `child_process`, `fs`, `path`)

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without execution, veridia is read-only analysis. The "do" step is the core loop's missing link. |
| Existing code reuse? | **Yes** — `src/agent/agents.ts` already has agent metadata; `src/verify/` already has command resolution. Reuse both. |
| Stdlib? | **Yes** — `child_process.execFileSync` for shell delegation; `fs.writeFileSync` for file-based delegation |
| Native platform? | **No** — no OS-level feature solves this |
| New dependency? | **No** — zero new dependencies. All delegation uses stdlib. |

## Complexity

Complexity: **normal**
