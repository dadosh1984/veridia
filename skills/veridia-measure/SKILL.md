---
name: veridia-measure
description: Record a run outcome or print history.
---

Records a run outcome (drift, token/cost data, verdict) to the local measurement store, or prints the recorded history. Used for tracking quality metrics over time.

**Usage**: `veridia measure --record <json>` or `veridia measure --history`

**Example**:
```bash
veridia measure --record '{"type":"feature","level":2,"verdict":"pass"}'
```
