## Context

See proposal.md — Why. Current state: three output types (ExecutionPlan, VerifyResult, LearnResult) have no versioning. Dead code accumulates. Small bugs exist.

## Goals / Non-Goals

**Goals:**
- Add `protocol` field to all three output types
- Document the protocol in `docs/protocol/`
- Fix classify patterns (add `\b` word boundaries)
- Fix delegation priority (file > stdout)
- Fix gate commands (read from package.json)
- Remove dead code (models, workflows, AgentInstruction, 'ai-ready')

**Non-Goals:**
- JSON Schema generation (can be added later without changing types)
- Breaking the existing JSON output format (protocol field is additive)

## Decisions

### Decision 1: Protocol string format

`"veridia/<type>/v1"` where type is `execution-plan`, `verification-report`, or `learn-result`.

**Why not semver?** The protocol is tied to the type system. A breaking change to the protocol means a new TypeScript type, which means a new major version. Semver inside the string would be redundant.

### Decision 2: Fix classify patterns

Hardcoded `RULES` in `classify.ts` use patterns without `\b` (`/fix/`). `DEFAULT_CONFIG` uses `\b` (`\\bfix\\b`). Change hardcoded patterns to match config.

**Why not remove hardcoded RULES entirely?** They serve as fallback when no config is provided. They should just be correct.

### Decision 3: Fix delegation priority

Current: `stdout > file > shell`. New: `file > shell > stdout`. File persists the plan for later use. Shell runs gates. Stdout is ephemeral.

### Decision 4: Fix gate commands

`CHECK_GATE_MAP` currently hardcodes `vitest run`. Change to read `test` script from `package.json` via `resolveCommands`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Protocol field changes JSON output shape | Additive change — existing consumers ignore unknown fields |
| Removing `models` from config breaks user configs | `models` was never used by any code — no runtime impact |

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Protocol field | 7 (Minimum) | Add string literal to existing interfaces |
| Protocol docs | 3 (Stdlib) | Markdown files |
| Fix classify patterns | 2 (Reuse) | Copy patterns from DEFAULT_CONFIG |
| Fix delegation priority | 7 (Minimum) | Reorder if-else chain |
| Fix gate commands | 2 (Reuse) | Use existing resolveCommands |
| Remove dead code | 1 (YAGNI) | Delete unused code |
