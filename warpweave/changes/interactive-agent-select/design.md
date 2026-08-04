## Context

See `proposal.md`. We add an interactive multi-agent `veridia init` that (a) lets a human pick several of the 35 agents, (b) pre-selects installed ones, (c) generates commands and installs skills per agent — all with zero runtime dependencies.

## Decisions

### 1. Checkbox multi-select on `node:readline` (stdlib, no `@inquirer`)
`ask/prompt.ts` already uses `createInterface`; we build a compact raw-mode renderer on top of it. Each agent is a checkbox row; arrow keys move the cursor, space toggles, Enter confirms. Non-blocking design: the renderer takes `{ choices, message, pageSize }` and returns the selected values. This is ladder rung 7 (minimum) / 3 (stdlib) — no new dependency, honoring the zero-runtime-deps rule.

### 2. Interactive guard (`src/util/interactive.ts`)
`shouldPrompt()` returns true only when `process.stdin.isTTY` is set, `CI` is absent from env, and `VERIDIA_NO_INTERACTIVE` / `--no-interactive` are absent. Non-interactive paths keep today's `--agent <id>` behavior (and accept several ids) or error listing the 35 valid ids — important because an AI agent like opencode drives `veridia init` with non-TTY stdin.

### 3. Source of choices and preselect
Choices come from `getAllAgents()` (id → `name`). A choice is pre-selected when `fs.existsSync(path.join(target, agent.configDir))`. Detected-but-unselected agents sort above the rest for visibility (same preselect logic as warpweave-dev, adapted).

### 4. Per-agent delivery
- Command-capable (`!skillsOnly`): call existing `generateCommands(agent, target)` → command files (adapters already branch flat/namespaced).
- Every selected agent: call `installSkills(agent, target)` → copy bundled `skills/veridia-*` into `<target>/<configDir>/skills/`.

### 5. Skill install source
Resolve the package root (as `version.ts` does via `import.meta.url`) to locate the bundled `skills/` dir; `installSkills` copies each `skills/veridia-*/SKILL.md` tree into the agent's `configDir/skills/`. Reuses the already-shipped assets in the npm tarball.

## Tasks

- [ ] 1.1 Add `shouldPrompt()` interactive guard in `src/util/interactive.ts`
  - **Ladder rung**: 1 (YAGNI — tiny predicate)
  - **Test first**: `test('shouldPrompt is false when CI or non-TTY', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/interactive.test.ts`

- [ ] 1.2 Add `src/prompts/checkbox-select.ts` (raw-mode multi-select on `node:readline`)
  - **Ladder rung**: 7 (minimum — stdlib raw-mode)
  - **Test first**: `test('checkboxSelect toggles and returns selected', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`

- [ ] 1.3 Add `installSkills(agent, target)` in `src/generate/skills.ts`
  - **Ladder rung**: 2 (reuse — copy bundled `skills/veridia-*`)
  - **Test first**: `test('installSkills copies veridia skills into configDir/skills', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/skills.test.ts`

- [ ] 1.4 Wire interactive multi-select + per-agent delivery into `src/cli/commands/init.ts`
  - **Ladder rung**: 2 (reuse — getAllAgents + generateCommands + installSkills)
  - **Test first**: `test('init without --agent in TTY builds agent choices with preselect', ...)`
  - **Verify**: `rtk pnpm exec tsc --noEmit`

