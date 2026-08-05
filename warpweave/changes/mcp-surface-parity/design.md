# Design: mcp-surface-parity

## Context

See proposal.md — Why. The MCP server (`src/mcp/index.ts`) currently registers 5 tools. The CLI (`src/cli/index.ts`) registers ~28 commands, each delegating to a library module. The gap is pure surface: the underlying functions exist (`buildPlan`, `ask`, `measureRecord`/`measureHistory`, `buildReviewInstructions`, session CRUD), they're just not wired as MCP tools.

## Goals / Non-Goals

**Goals:**
- Every library-backed CLI command is reachable as an MCP tool
- Tool responses stay clean JSON in the MCP content channel (machine-output discipline)
- Parity is enforced by a test, not by memory

**Non-Goals:**
- Not replacing the CLI — MCP mirrors it, CLI remains the source of command definitions
- Not wrapping interactive commands (`init`, `run` wizard, `watch`, `dashboard`) that need TTY/clack
- Not introducing new library functionality — reuse only

## Decisions

### Decision 1: thin wrappers over existing library functions

Each new tool is a small switch-arm in `CallToolRequestSchema` that validates args, calls the existing library function, and returns `{ content: [{ type: 'text', text: JSON.stringify(result) }] }` — exactly the pattern the existing 5 tools use (`src/mcp/index.ts:84-125`). No shared orchestration layer needed.

Tool → function map (from `src/` exports):
| Tool | Function |
|------|----------|
| `veridia_route` | `buildPlan(type, level)` |
| `veridia_ask` | `ask(type, level)` |
| `veridia_measure` | `measureRecord(...)` / `measureHistory(...)` |
| `veridia_report` | `generateReport(target)` |
| `veridia_review` | `buildReviewInstructions(target)` |
| `veridia_session_*` | `readSession`/`writeSession`/`clearSession` + step functions |

### Decision 2: parity test as the enforcement mechanism

A test imports both the CLI command registry (the list of commands in `src/cli/index.ts`) and the MCP tool list, and asserts every command whose handler is library-backed (not TTY/interactive-only) has a `veridia_*` tool. This is the spec's "tool coverage is verified" requirement made concrete — an oracle, per verifiability philosophy.

### Decision 3: interactive commands excluded

`init`, `run` (wizard mode), `watch`, `dashboard`, `benchmark` (interactive TTY flows) are not exposed as tools. Their TTY-dependent prompts make them unsuitable for MCP; agents drive the pipeline through the step tools instead. This is documented in the tool descriptions.

## Risks / Trade-offs

- [Parity test hardcodes the expected set and drifts when commands change] → Mitigation: the test derives the expected set from the CLI registry programmatically where possible, with an explicit allowlist for interactive commands.
- [Session tools write to `.veridia/` in the target repo] → Mitigation: each session tool takes `target` (defaults cwd) and passes it to session functions — same semantics as the CLI.
- [Response size for report tools] → Mitigation: keep JSON compact; the content channel already carries full plans today (`veridia_plan`).

## Migration Plan

Single change; additive (new tools), no removal of existing 5, no breaking change for current MCP clients.

## Open Questions

None. Tool set, naming, and parity enforcement are decided; per-tool arg schemas mirror the CLI options already defined in `src/cli/index.ts`.
