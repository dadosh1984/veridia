## Why

The MCP server exposes only 5 tools (`veridia_classify`, `veridia_assess`, `veridia_plan`, `veridia_verify`, `veridia_learn` — `src/mcp/index.ts:18-77`) while the CLI has ~28 commands. `veridia init` is built to target 35 AI agents, which makes MCP effectively the primary interface for AI-agent consumers — yet route, ask, measure, report, run, and the session-* pipeline are missing from it. An agent driving veridia through MCP gets a fraction of the product.

## What Changes

- Add MCP tools mirroring the CLI commands that map onto library functions
- New tools: `veridia_route` (buildPlan → run plan), `veridia_ask` (clarifying questions), `veridia_measure` (record + history summary), `veridia_report` (quality report), `veridia_review` (review instructions), `veridia_session_*` (classify/assess/route/ask/do/status/archive)
- Keep tool naming namespaced (`veridia_<cmd>`) and consistent with the existing 5
- Reuse the machine-output discipline (see `fix-exec-shim-stdout`): tool responses are clean JSON text in the MCP content channel

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — there is no existing MCP spec; MCP surface behavior is currently unspecced. The parity itself is the capability)

## Impact

- `src/mcp/index.ts` — expand `ListToolsRequestSchema` and `CallToolRequestSchema` with the new tools
- Reused modules: `src/route/route.ts` (buildPlan), `src/ask/ask.ts`, `src/measure/measure.ts` (measureRecord/measureHistory), `src/measure/history.ts` (appendEntry), `src/review/review.ts` (buildReviewInstructions), `src/session/session.ts` (read/write/clearSession), `src/analyze/report.ts` (buildReport) if present
- `test/mcp.test.ts` — tool-list and call parity tests
- `src/cli/index.ts` — no change (CLI surface already defines the command set; MCP mirrors it)

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — MCP is the agent-facing interface; 5-of-28 coverage is a coverage gap |
| Existing code reuse? | **Yes** — every new tool maps 1:1 onto an existing library function |
| Stdlib? | **Yes** — no new transport or protocol code; existing MCP SDK handlers |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
