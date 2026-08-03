## 1. Types and Agent Capabilities

- [x] 1.1 Add execution plan types to `src/execute/types.ts`
  - **Spec scenario**: Plan is serializable to JSON
  - **Ladder rung**: 7 (Minimum — new interfaces)
  - **Test first**: `test('ExecutionPlan has required fields', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 1.2 Extend agent metadata with capability table in `src/agent/agents.ts`
  - **Spec scenario**: Host agent is detected at runtime
  - **Ladder rung**: 2 (Reuse — extend existing `AgentInfo`)
  - **Test first**: `test('agent capabilities include delegation modes', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/agent.test.ts`

## 2. Host Detection

- [x] 2.1 Implement host agent detection in `src/execute/detect.ts`
  - **Spec scenario**: Detect Claude Code / OpenCode / fallback to generic shell
  - **Ladder rung**: 3 (Stdlib — `process.env` + `fs.existsSync`)
  - **Test first**: `test('detects host from environment variable', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

## 3. Plan Builder

- [x] 3.1 Implement plan builder in `src/execute/plan.ts`
  - **Spec scenario**: Route plan maps to execution steps
  - **Ladder rung**: 7 (Minimum — compose existing types)
  - **Test first**: `test('buildPlan creates ExecutionPlan from RunPlan', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 3.2 Plan includes file targets from task context
  - **Spec scenario**: Plan lists files to modify
  - **Ladder rung**: 7 (Minimum — accept file list as parameter)
  - **Test first**: `test('plan includes file paths when provided', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 3.3 Plan includes verification gates from route checks
  - **Spec scenario**: Verify gate after implementation
  - **Ladder rung**: 2 (Reuse — `src/route/route.ts` already produces checks)
  - **Test first**: `test('plan embeds route checks as gates', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

## 4. Delegation Layer

- [x] 4.1 Implement stdout delegation mode in `src/execute/delegate.ts`
  - **Spec scenario**: Claude Code namespaced invocation
  - **Ladder rung**: 3 (Stdlib — `process.stdout.write`)
  - **Test first**: `test('stdout delegation prints plan JSON', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 4.2 Implement file delegation mode
  - **Spec scenario**: OpenCode flat invocation
  - **Ladder rung**: 3 (Stdlib — `fs.writeFileSync`)
  - **Test first**: `test('file delegation writes plan to .veridia/plan.json', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

- [x] 4.3 Implement shell delegation mode (fallback)
  - **Spec scenario**: Fallback to generic shell
  - **Ladder rung**: 3 (Stdlib — `child_process.execFileSync`)
  - **Test first**: `test('shell delegation runs verification commands', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/execute.test.ts`

## 5. CLI Commands

- [x] 5.1 Add `veridia plan` subcommand to CLI
  - **Spec scenario**: Plan outputs valid JSON
  - **Ladder rung**: 2 (Reuse — follow existing CLI pattern)
  - **Test first**: `test('plan command outputs valid JSON with steps and gates', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 5.2 Add `veridia execute` subcommand to CLI
  - **Spec scenario**: Successful execution returns exit code 0
  - **Ladder rung**: 2 (Reuse — follow existing CLI pattern)
  - **Test first**: `test('execute command runs plan and returns result', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 5.3 Remove `--agent` flag from classify, route, ask commands
  - **Spec scenario**: (cleanup — no spec change)
  - **Ladder rung**: 1 (YAGNI — remove dead code)
  - **Test first**: `test('classify --agent returns error', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 6. Wire "Do" Step into Triage

- [x] 6.1 Modify `src/triage/triage.ts` to include execution step
  - **Spec scenario**: Full cycle recorded
  - **Ladder rung**: 2 (Reuse — call new execute module)
  - **Test first**: `test('triage runs execute step and records result', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 6.2 Post-execution verify in triage loop
  - **Spec scenario**: Verify after file modification
  - **Ladder rung**: 2 (Reuse — `src/verify/verify.ts` already works)
  - **Test first**: `test('triage verifies after execution', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

## 7. Update Generate Commands

- [x] 7.1 Update `src/generate/adapters.ts` with new plan/execute commands
  - **Spec scenario**: (infrastructure — no spec change)
  - **Ladder rung**: 2 (Reuse — follow existing pattern)
  - **Test first**: `test('generate includes plan and execute commands', () => { ... })`
  - **Verify**: `rtk pnpm exec vitest run test/generate.test.ts`
