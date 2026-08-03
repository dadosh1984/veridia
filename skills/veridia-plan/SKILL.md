---
name: veridia-plan
description: Generate an execution plan for the host agent.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Produces a structured execution plan that a host AI agent can follow. The plan includes steps, verification gates, and file targets based on the task type and verifiability level.

**Input**: Task type, verifiability level, optional file list, and optional target path.

**Usage**: `veridia plan --type <type> --level <level> [--files <files>] [--target <path>]`

**Output**: `{"steps": [{"action": "...", "target": "...", "verify": "..."}], "gates": ["..."]}`

**Example**:
```bash
veridia plan --type feature --level 2 --files src/foo.ts --target ./src
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
