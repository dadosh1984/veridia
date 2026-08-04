## Why

Three pieces of dead code exist in the codebase: `callModel()` in `orchestrate.ts` (synchronous wrapper never used), `getAgentCapabilities()` in `agents.ts` (identical to `getAgent()`), and `computeSensitivity()` in `mutate.ts` (exported but never called from the pipeline — will be wired in `wire-feedback-loop` but the standalone export is dead until then). Removing dead code reduces maintenance burden and improves clarity.

## What Changes

- **Remove `callModel()` from `src/execute/orchestrate.ts`**: Synchronous wrapper that only handles stdio; `callModelAsync()` is the only caller
- **Remove `getAgentCapabilities()` from `src/agent/agents.ts`**: Identical to `getAgent()`, only called in tests
- **Update tests**: Remove tests for removed functions

## Capabilities

No spec-level behavior changes — pure refactoring.

## Impact

| Area | Impact |
|------|--------|
| `src/execute/orchestrate.ts` | Remove `callModel()` function |
| `src/agent/agents.ts` | Remove `getAgentCapabilities()` function |
| `test/agent.test.ts` | Remove test for `getAgentCapabilities()` |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — dead code should be removed |
| Existing code reuse? | **N/A** — removal, not addition |
| Stdlib? | **N/A** |
| Native platform? | **N/A** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
