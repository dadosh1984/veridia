# VerificationReport Protocol

**Version:** `veridia/verification-report/v1`

## Purpose

A VerificationReport tells veridia (or any consumer) whether the executed work passed its quality gates. It is the output of the verify step.

## Format

```json
{
  "protocol": "veridia/verification-report/v1",
  "checks": [
    {
      "kind": "test-runner",
      "command": "vitest run",
      "weight": 3,
      "weak": false,
      "passed": true
    },
    {
      "kind": "type-check",
      "command": "tsc --noEmit",
      "weight": 2,
      "weak": false,
      "passed": true
    }
  ],
  "verdict": "PASS"
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Always `"veridia/verification-report/v1"` |
| `checks` | array | List of verification checks run |
| `checks[].kind` | string | Oracle kind: `test-runner`, `type-check`, `lint`, `ci`, `test-content` |
| `checks[].command` | string | The command that was executed |
| `checks[].weight` | number | Oracle weight (3=test-runner, 2=type-check, 1=lint, 0=ci) |
| `checks[].weak` | boolean | True if the check is considered weak (empty test files) |
| `checks[].passed` | boolean | True if the command exited 0 |
| `verdict` | string | Overall verdict: `PASS`, `FAIL`, `HUMAN` |

## Verdict Rules

| Level | All strong checks pass | Some fail | No strong checks |
|-------|----------------------|-----------|-----------------|
| 3 | PASS | FAIL | HUMAN |
| 2 | PASS | FAIL | HUMAN |
| 1 | HUMAN | HUMAN | HUMAN |
| 0 | HUMAN | HUMAN | HUMAN |

## Consumer Contract

1. Read `protocol` to confirm format version
2. Check `verdict` for overall result
3. Inspect individual `checks` for details
4. If `verdict` is `HUMAN`, human review is required
