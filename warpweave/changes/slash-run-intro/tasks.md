## 1. Complete and coherent slash-command set

- [x] 1.1 Add `run`, `intro`, and `session-*` commands to `src/generate/adapters.ts`
  - **Ladder rung**: 2 (reuse — extend the COMMANDS table)
  - **Test first**: `test('generated commands include run and intro', ...)` + update count
  - **Verify**: `rtk pnpm exec vitest run test/generate.test.ts`

- [x] 1.2 Add `skills/veridia-intro/SKILL.md`
  - **Ladder rung**: 1 (YAGNI — docs/skill)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

