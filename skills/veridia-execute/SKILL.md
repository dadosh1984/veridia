---
name: veridia-execute
description: Execute a plan via the host agent.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Dispatches the execution plan to the host agent for implementation. The host agent carries out the steps defined by `plan` and reports results back through veridia's verification pipeline.

**Input**: Task type, verifiability level, optional file list, and optional target path.

**Usage**: `veridia execute --type <type> --level <level> [--files <files>] [--target <path>]`

**Output**: `{"status": "<running|completed|failed>", "output": "...", "errors": ["..."]}`

**Example**:
```bash
veridia execute --type feature --level 2 --files src/foo.ts --target ./src
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
