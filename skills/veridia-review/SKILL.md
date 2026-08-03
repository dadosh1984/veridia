---
name: veridia-review
description: Output code review instructions for an AI agent.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Generates a structured code review prompt tailored for an AI agent. The output includes review focus areas, file-level guidance, and verification gates to check.

**Input**: A target directory path.

**Usage**: `veridia review --target <path>`

**Output**: `{"focus": ["...", "..."], "files": ["..."], "instructions": "..."}`

**Example**:
```bash
veridia review --target ./src
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
