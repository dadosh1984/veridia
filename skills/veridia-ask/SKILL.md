---
name: veridia-ask
description: Ask clarifying questions for levels 0/1.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Generates clarifying questions when the verifiability level is too low (0 or 1) to proceed confidently. The questions help the user define what "done" looks like for the task.

**Input**: A task type and verifiability level.

**Usage**: `veridia ask --type <type> --level <level>`

**Output**: `{"questions": ["...", "..."], "context": "<explanation>"}`

**Example**:
```bash
veridia ask --type feature --level 1
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
