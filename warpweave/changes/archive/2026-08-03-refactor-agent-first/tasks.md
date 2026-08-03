## 1. Config System

- [x] 1.1 Create `src/config/config.ts` with `loadConfig()` and default config
  - **Ladder rung**: 3 (stdlib — `readFileSync` + `JSON.parse`)
  - **Verify**: `vitest test/config.test.ts`

- [x] 1.2 Create default `.veridia/config.json` template with patterns, probes, workflows, and model tiers
  - **Ladder rung**: 3 (stdlib — plain JSON)
  - **Verify**: `vitest test/config.test.ts`

## 2. JSON Output

- [x] 2.1 Refactor `src/cli/index.ts` — all commands output JSON by default, remove tab-separated text
  - **Ladder rung**: 2 (reuse — same logic, different `process.stdout.write`)
  - **Verify**: `vitest test/cli.test.ts`

- [x] 2.2 Refactor `src/triage/triage.ts` — return structured JSON instead of formatted string
  - **Ladder rung**: 2 (reuse — same logic, different return type)
  - **Verify**: `vitest test/triage.test.ts`

## 3. Agent Command Generation

- [x] 3.1 Create `src/generate/adapters.ts` with adapters for claude, opencode, cursor (using `veridia/` namespace)
  - **Ladder rung**: 2 (reuse — same pattern as warpweave-dev adapters)
  - **Verify**: `vitest test/generate.test.ts`

- [x] 3.2 Create `src/generate/generate.ts` with `generateCommands()` function
  - **Ladder rung**: 2 (reuse — writes files to agent config directories)
  - **Verify**: `vitest test/generate.test.ts`

## 4. Init Command

- [x] 4.1 Add `init` and `generate` subcommands to `src/cli/index.ts`
  - **Ladder rung**: 2 (reuse — same flat `if/else if` pattern)
  - **Verify**: `vitest test/cli.test.ts`

## 5. Tests

- [x] 5.1 Create `test/config.test.ts` with tests for config loader
  - **Ladder rung**: 2 (reuse — same vitest pattern)
  - **Verify**: `vitest test/config.test.ts`

- [x] 5.2 Create `test/generate.test.ts` with tests for agent command generation
  - **Ladder rung**: 2 (reuse — same vitest pattern)
  - **Verify**: `vitest test/generate.test.ts`
