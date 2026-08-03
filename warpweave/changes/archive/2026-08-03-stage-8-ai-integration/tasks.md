## 1. Agent Definitions

- [x] 1.1 Create `src/agent/agents.ts` with the full list of 33 supported AI agents (from warpweave-dev), each with id, name, configDir, and invocation style
  - **Spec scenario**: agents --list
  - **Ladder rung**: 2 (reuse — same 33 agents as warpweave-dev)
  - **Test first**: `test('agents list includes claude, cursor, opencode', () => { ... })`
  - **Verify**: `vitest test/agent.test.ts`

- [x] 1.2 Create `src/agent/types.ts` with `AgentInfo` and `AgentInstruction` types
  - **Spec scenario**: classify with --agent, ask with --agent
  - **Ladder rung**: 3 (stdlib — plain TypeScript types)
  - **Test first**: `test('AgentInfo has required fields', () => { ... })`
  - **Verify**: `vitest test/agent.test.ts`

## 2. Review Module

- [x] 2.1 Create `src/review/types.ts` with `ReviewInstruction` and `ReviewFile` types
  - **Spec scenario**: review subcommand outputs agent instructions
  - **Ladder rung**: 3 (stdlib — plain TypeScript types)
  - **Test first**: `test('ReviewInstruction has required fields', () => { ... })`
  - **Verify**: `vitest test/review.test.ts`

- [x] 2.2 Create `src/review/review.ts` with `buildReviewInstructions()` function
  - **Spec scenario**: review with target
  - **Ladder rung**: 2 (reuse — same pattern as `measure/measure.ts`)
  - **Test first**: `test('buildReviewInstructions outputs JSON with files and patterns', () => { ... })`
  - **Verify**: `vitest test/review.test.ts`

## 3. AI Agent Instruction Format

- [x] 3.1 Add `buildAgentInstruction()` helper to `src/util/agent-instruction.ts`
  - **Spec scenario**: classify with --agent, ask with --agent
  - **Ladder rung**: 3 (stdlib — `JSON.stringify`)
  - **Test first**: `test('buildAgentInstruction returns valid JSON', () => { ... })`
  - **Verify**: `vitest test/review.test.ts`

## 4. CLI Integration

- [x] 4.1 Add `agents` subcommand (--list) and `review` subcommand to `src/cli/index.ts`
  - **Spec scenario**: agents --list, review subcommand dispatched
  - **Ladder rung**: 2 (reuse — same flat `if/else if` pattern)
  - **Test first**: `test('veridia agents --lists all agents', () => { ... })`
  - **Verify**: `vitest test/cli.test.ts`

- [x] 4.2 Add `--agent` flag handling to `classify`, `ask`, and `route` branches
  - **Spec scenario**: classify with --agent flag, ask with --agent flag
  - **Ladder rung**: 2 (reuse — same `--target` flag pattern)
  - **Test first**: `test('veridia classify --agent claude outputs agent instructions', () => { ... })`
  - **Verify**: `vitest test/cli.test.ts`

## 5. Route ai-ready Depth

- [x] 5.1 Add `ai-ready` to `OrchestrationDepth` type in `src/route/types.ts`
  - **Spec scenario**: route with ai-ready depth
  - **Ladder rung**: 6 (one-liner — add value to union type)
  - **Test first**: `test('route --agent includes ai-ready depth', () => { ... })`
  - **Verify**: `vitest test/route.test.ts`

- [x] 5.2 Add `--agent` flag to route CLI branch
  - **Spec scenario**: route with --agent
  - **Ladder rung**: 2 (reuse — same flag pattern)
  - **Test first**: `test('veridia route --type feature --level 3 --agent claude outputs agent plan', () => { ... })`
  - **Verify**: `vitest test/cli.test.ts`

## 6. Tests

- [x] 6.1 Create `test/agent.test.ts` with tests for agent definitions
  - **Spec scenario**: all agent spec scenarios
  - **Ladder rung**: 2 (reuse — same vitest + helpers pattern)
  - **Test first**: N/A (this IS the test file)
  - **Verify**: `vitest test/agent.test.ts`

- [x] 6.2 Create `test/review.test.ts` with tests for review module and agent instruction helper
  - **Spec scenario**: all review spec scenarios
  - **Ladder rung**: 2 (reuse — same vitest + helpers pattern)
  - **Test first**: N/A (this IS the test file)
  - **Verify**: `vitest test/review.test.ts`
