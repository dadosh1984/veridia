## Context

See `proposal.md`. Three pieces of dead code: `callModel()`, `getAgentCapabilities()`, and the test for the latter.

## Decisions

Simple removal. No behavioral impact.

## Tasks

- [x] 1.1 Remove `callModel()` from `src/execute/orchestrate.ts`
- [x] 1.2 Remove `getAgentCapabilities()` from `src/agent/agents.ts`
- [x] 1.3 Remove test for `getAgentCapabilities()` from `test/agent.test.ts`
