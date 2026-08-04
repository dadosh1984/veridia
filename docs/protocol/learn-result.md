# LearnResult Protocol

**Version:** `veridia/learn-result/v1`

## Purpose

A LearnResult tells veridia (or any consumer) how well the system has been performing over time. It is the output of the `veridia learn` command.

## Format

```json
{
  "protocol": "veridia/learn-result/v1",
  "totalRuns": 42,
  "classificationAccuracy": {
    "bugfix": 0.85,
    "feature": 0.70,
    "refactor": 0.60
  },
  "successRateByLevel": {
    "3": 0.92,
    "2": 0.75,
    "1": 0.40
  },
  "oraclePrecision": {
    "test-runner": 0.95,
    "type-check": 0.80
  },
  "driftPatterns": [
    "fix login: drift=1 (type=bugfix, level=3)"
  ],
  "recommendations": [
    "Classification accuracy for 'refactor' is low (60%). Consider adjusting patterns in .veridia/config.json.",
    "Level 1 has low success rate (40%). Consider using a more expensive model tier."
  ]
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Always `"veridia/learn-result/v1"` |
| `totalRuns` | number | Total number of recorded runs |
| `classificationAccuracy` | object | PASS rate per task type |
| `successRateByLevel` | object | PASS rate per verifiability level |
| `oraclePrecision` | object | Precision (TP/(TP+FP)) per oracle kind |
| `driftPatterns` | string[] | Entries with non-zero drift |
| `recommendations` | string[] | Actionable suggestions |

## Consumer Contract

1. Read `protocol` to confirm format version
2. Use `recommendations` for actionable improvements
3. Track `classificationAccuracy` over time to detect regressions
