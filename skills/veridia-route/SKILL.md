---
name: veridia-route
description: Route (type, level) to a run plan.
---

Maps a (task type, verifiability level) pair to a model tier and orchestration strategy. Determines which model should handle the task and what verification gates to enforce.

**Usage**: `veridia route --type <type> --level <level>`

**Example**:
```bash
veridia route --type feature --level 2
```
