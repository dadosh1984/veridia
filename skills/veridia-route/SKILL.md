---
name: veridia-route
description: Route (type, level) to a run plan.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Maps a (task type, verifiability level) pair to a model tier and orchestration strategy. Determines which model should handle the task and what verification gates to enforce.

**Input**: A task type and verifiability level.

**Usage**: `veridia route --type <type> --level <level>`

**Output**: `{"tier": "<fast|balanced|capable>", "model": "<model-name>", "gates": ["lint", "test", ...]}`

**Example**:
```bash
veridia route --type feature --level 2
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
