## Context

See `proposal.md`. The generated slash-command set is missing `run`, `intro`, and the `session-*` step-by-step commands.

## Decisions

### 1. Add missing commands to `COMMANDS` in `src/generate/adapters.ts`
Append entries for `run`, `intro`, and `session-classify/assess/route/ask/do/status/archive`, each with a `veridia <cmd> ...` body and description.

### 2. Add `skills/veridia-intro/SKILL.md`
A short onboarding skill (`name: veridia-intro`) that tells the agent how to run one-shot vs step-by-step and where the guide lives (`docs/usage.md`).

### 3. Coherent command logic
The final set maps to the real CLI:
- `intro` — orientation
- `run` / `triage` — one-shot full loop (human / JSON)
- `session-classify → session-assess → session-route → session-ask → session-do → session-archive` (+ `session-status` anytime)
- `classify/assess/route/ask/plan/execute/verify/measure/review/agents` — building blocks

## Tasks

- [ ] 1.1 Add `run`, `intro`, and `session-*` commands to `src/generate/adapters.ts`
  - **Ladder rung**: 2 (reuse — extend the COMMANDS table)
  - **Test first**: `test('generated commands include run and intro', ...)` + update count
  - **Verify**: `rtk pnpm exec vitest run test/generate.test.ts`

- [ ] 1.2 Add `skills/veridia-intro/SKILL.md`
  - **Ladder rung**: 1 (YAGNI — docs/skill)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
