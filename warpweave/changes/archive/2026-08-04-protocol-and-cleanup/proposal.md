## Why

veridia has two fundamental problems: (1) its output formats have no versioning — any consumer must guess the schema, (2) it has accumulated dead code and small bugs that undermine reliability. This change establishes veridia as an **open protocol** (Вариант C) and cleans up the codebase.

## What Changes

- **Add `protocol` field** to ExecutionPlan, VerifyResult, and LearnResult — versioned as `"veridia/<type>/v1"`
- **Document the protocol** in `docs/protocol/` — three markdown specs that any AI agent can implement
- **Fix classify patterns** — hardcoded `RULES` now use `\b` word boundaries, matching `DEFAULT_CONFIG`
- **Fix delegation priority** — prefer `file` mode over `stdout` (file persists, stdout is ephemeral)
- **Fix gate commands** — `CHECK_GATE_MAP` reads test script from `package.json` instead of hardcoded `vitest run`
- **Remove dead code** — `models` and `workflows` from config, `AgentInstruction` interface, `'ai-ready'` type
- **Clean unused imports** — `readFileSync` in checks.ts, unused types

## Capabilities

### New Capabilities
- `protocol-specification`: Versioned JSON protocol for ExecutionPlan, VerificationReport, LearnResult

### Modified Capabilities
- (none — pure refactoring and cleanup)

## Impact

- `src/execute/types.ts` — add `protocol` field to ExecutionPlan
- `src/verify/types.ts` — add `protocol` field to VerifyResult
- `src/measure/learn.ts` — add `protocol` field to LearnResult
- `src/classify/classify.ts` — fix hardcoded patterns (add `\b`)
- `src/execute/delegate.ts` — fix delegation priority (file > stdout)
- `src/execute/plan.ts` — fix CHECK_GATE_MAP to read package.json
- `src/config/config.ts` — remove `models` and `workflows`
- `src/agent/types.ts` — remove `AgentInstruction`
- `src/route/types.ts` — remove `'ai-ready'`
- `src/analyze/checks.ts` — remove unused import
- `docs/protocol/` — 3 new files
- No new dependencies

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — protocol is core to Вариант C positioning |
| Existing code reuse? | **Yes** — types already exist, just need `protocol` field |
| Stdlib? | **Yes** — JSON Schema can be generated from TypeScript |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
