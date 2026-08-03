# ExecutionPlan Protocol

**Version:** `veridia/execution-plan/v1`

## Purpose

An ExecutionPlan tells an AI agent *what* to do — which steps to execute, which files to modify, and which verification gates to pass. The agent decides *how* to do it.

## Format

```json
{
  "protocol": "veridia/execution-plan/v1",
  "task": "fix login timeout",
  "type": "bugfix",
  "level": 3,
  "plan": {
    "depth": "full-tdd",
    "tier": "cheapest",
    "steps": [
      {
        "id": "write-failing-test",
        "action": "Write a failing test for the expected behavior",
        "files": ["test/login.test.ts"]
      },
      {
        "id": "implement",
        "action": "Implement the solution to make the test pass",
        "files": ["src/login.ts"]
      },
      {
        "id": "verify",
        "action": "Run verification gates to confirm correctness",
        "gates": ["run-tests", "type-check"]
      }
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

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Always `"veridia/execution-plan/v1"` |
| `task` | string | The original task description |
| `type` | string | Task type: `bugfix`, `refactor`, `feature`, `doc`, `explore`, `open` |
| `level` | number | Verifiability level: 0-3 |
| `plan.depth` | string | Orchestration depth: `full-tdd`, `tdd-where-possible`, `minimal`, `just-do-it` |
| `plan.tier` | string | Model tier: `cheapest`, `mid`, `any` |
| `plan.steps` | array | Ordered list of execution steps |
| `plan.steps[].id` | string | Step identifier |
| `plan.steps[].action` | string | Human-readable description of what to do |
| `plan.steps[].files` | string[] | Files relevant to this step (optional) |
| `plan.steps[].gates` | string[] | Gate IDs to run after this step (optional) |
| `plan.gates` | array | Verification gates with commands |
| `plan.gates[].id` | string | Gate identifier |
| `plan.gates[].command` | string | Shell command to run |
| `plan.gates[].kind` | string | Oracle kind: `test-runner`, `type-check`, `lint`, `ci` |
| `metadata.host` | string | Detected host agent id |
| `metadata.generatedAt` | string | ISO 8601 timestamp |

## Consumer Contract

1. Read `protocol` to confirm format version
2. Execute steps in order
3. After each step with `gates`, run the referenced gates
4. Report results back as a VerificationReport
