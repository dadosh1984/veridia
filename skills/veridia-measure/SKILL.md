---
name: veridia-measure
description: Record a run outcome or print history.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Records a run outcome (drift, token/cost data, verdict) to the local measurement store, or prints the recorded history. Used for tracking quality metrics over time.

**Input**: Either a JSON record string or the `--history` flag.

**Usage**: `veridia measure --record <json>` or `veridia measure --history`

**Output**: `{"status": "<recorded|history>", "data": {...}}`

**Example**:
```bash
veridia measure --record '{"type":"feature","level":2,"verdict":"pass","tokens":1500}'
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
