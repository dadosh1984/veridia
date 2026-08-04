## 1. Interactive multi-agent init

- [x] 1.1 Add `shouldPrompt()` interactive guard in `src/util/interactive.ts`
  - **Ladder rung**: 1 (YAGNI — tiny predicate)
  - **Test first**: `test('shouldPrompt is false when CI or non-TTY', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/interactive.test.ts`

- [x] 1.2 Add `src/prompts/checkbox-select.ts` (raw-mode multi-select on `node:readline`)
  - **Ladder rung**: 7 (minimum — stdlib raw-mode)
  - **Test first**: `test('checkboxSelect toggles and returns selected', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`

- [x] 1.3 Add `installSkills(agent, target)` in `src/generate/skills.ts`
  - **Ladder rung**: 2 (reuse — copy bundled `skills/veridia-*`)
  - **Test first**: `test('installSkills copies veridia skills into configDir/skills', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/skills.test.ts`

- [x] 1.4 Wire interactive multi-select + per-agent delivery into `src/cli/commands/init.ts`
  - **Ladder rung**: 2 (reuse — getAllAgents + generateCommands + installSkills)
  - **Test first**: `test('init without --agent in TTY builds agent choices with preselect', ...)`
  - **Verify**: `rtk pnpm exec tsc --noEmit`

