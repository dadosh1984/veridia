## Context

See proposal.md — Why. Current state: veridia has classify, assess, route, ask, verify, measure — but no "do" step. The `--agent` flag generates JSON instructions that are never consumed by any runtime.

Key constraints:
- Zero new runtime dependencies (stdlib only)
- Must work with all 35 listed agents (Claude Code, Cursor, OpenCode, etc.)
- Must also work when invoked directly from a shell (no host agent)
- Existing `src/agent/agents.ts` metadata (invocationStyle, configDir, invocationPrefix) must be reused

## Goals / Non-Goals

**Goals:**
- Add the "do" step to the triage loop: `assess → route → ask? → execute → verify → measure`
- Detect the host agent at runtime and delegate execution via its native protocol
- Output structured execution plans as JSON for the host agent to consume
- Keep verify working as a post-execution gate

**Non-Goals:**
- Calling external model APIs (OpenAI, Anthropic, etc.) — the host agent does that
- Running a model server or inference — veridia is a process layer, not a model layer
- Replacing the host agent's own execution — veridia delegates, it does not micromanage

## Decisions

### Decision 1: Host detection via environment + config files

veridia detects the host agent by checking:
1. Environment variables (`CLAUDE_CODE`, `OPENCODE`, `CURSOR`, etc.)
2. Config directory existence (`.claude/`, `.opencode/`, `.cursor/`, etc.)
3. Process arguments (e.g., `--agent` flag passed to veridia)

**Why not a config file?** The host agent is a runtime property, not a project property. A user might run veridia from Claude Code today and Cursor tomorrow. Environment + process detection is automatic and stateless.

**Why not require explicit `--agent`?** The whole point is that veridia should "just work" when invoked by any agent. Explicit flag is a fallback override.

### Decision 2: Three delegation modes

| Mode | Mechanism | Used when |
|------|-----------|-----------|
| **stdout** | Print plan as JSON to stdout | Host agent reads stdout (all CLI-based agents) |
| **file** | Write plan to `.veridia/plan.json` | Host agent watches file changes |
| **shell** | Execute commands via `child_process` | No host agent detected (bare shell) |

**Why three modes?** Different agents have different capabilities. Claude Code reads stdout from tools. Cursor watches `.cursor/rules/`. OpenCode reads `.opencode/commands/`. The delegation layer abstracts this.

### Decision 3: Plan is a flat JSON structure, not nested steps

```json
{
  "task": "add dark mode support",
  "type": "feature",
  "level": 2,
  "plan": {
    "depth": "tdd-where-possible",
    "tier": "mid",
    "steps": [
      { "id": "ask", "action": "clarify requirements with user" },
      { "id": "write-failing-test", "action": "write test for dark mode toggle", "files": ["test/theme.test.ts"] },
      { "id": "implement", "action": "implement dark mode", "files": ["src/theme.ts", "src/components/Header.tsx"] },
      { "id": "verify", "action": "run verification gates", "gates": ["run-tests", "type-check"] }
    ],
    "gates": [
      { "id": "run-tests", "command": "vitest run", "kind": "test-runner" },
      { "id": "type-check", "command": "tsc --noEmit", "kind": "type-check" }
    ]
  },
  "metadata": {
    "host": "opencode",
    "generatedAt": "2026-08-04T00:00:00.000Z"
  }
}
```

**Why flat?** The host agent is the executor — it decides how to interpret steps. veridia's job is to provide the *what*, not the *how*. Flat JSON is parseable by any agent without a custom interpreter.

### Decision 4: `execute` command is synchronous and blocking

veridia runs the plan, waits for the host agent to complete, then runs verification. This keeps the triage loop simple: one call, one result.

**Why not async/event-driven?** The host agent is already running in the same process/terminal. There's no event bus. Synchronous delegation via stdout/file is the simplest correct approach.

### Decision 5: Agent metadata becomes a capability table

Current `agents.ts` has invocation style only. Extended with:

```typescript
interface AgentCapability {
  delegationModes: ('stdout' | 'file' | 'shell')[];
  canWriteFiles: boolean;
  canRunShell: boolean;
  canCallModels: boolean;
}
```

**Why capabilities instead of just styles?** Two agents with the same invocation style may have different capabilities. E.g., both use `/ww-` prefix but one can write files and the other can't. Capabilities let the delegation layer choose the right mode.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Host agent ignores the plan | veridia cannot force execution — it's a delegation, not a command. The verify step catches non-compliance. |
| File-based delegation has race conditions | Use atomic writes (`writeFileSync` + sync reads). The host agent reads the file after veridia exits. |
| stdout delegation mixes with veridia's own output | Use stderr for veridia's own messages, stdout exclusively for the plan JSON. The `--json` flag controls output format. |
| Shell fallback is dangerous (runs arbitrary commands) | Shell fallback only runs the verification commands (from route plan's checks), not the implementation steps. Implementation always requires a host agent. |

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Host detection | 3 (Stdlib) | `process.env` + `fs.existsSync` — no deps needed |
| Plan builder | 7 (Minimum) | Simple function composing existing types from route + classify |
| Delegation (stdout) | 3 (Stdlib) | `process.stdout.write` — built-in |
| Delegation (file) | 3 (Stdlib) | `fs.writeFileSync` — built-in |
| Delegation (shell) | 3 (Stdlib) | `child_process.execFileSync` — built-in |
| Agent capability table | 2 (Reuse) | Extend `src/agent/agents.ts` with capability fields |
| Verify post-exec | 2 (Reuse) | `src/verify/verify.ts` already accepts target + kinds |
| Plan types | 7 (Minimum) | New interfaces in `src/execute/types.ts` |
