---
name: veridia-verify
description: Run a target's checks and print a verdict.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Runs the verification checks (lint, typecheck, test, CI) appropriate for the given task type and verifiability level against a target directory. Returns a pass/fail verdict with details.

**Input**: Target path, task type, verifiability level, optional dry-run flag.

**Usage**: `veridia verify --target <path> --type <type> --level <level> [--dry-run]`

**Output**: `{"verdict": "<pass|fail|partial>", "results": {"lint": {...}, "typecheck": {...}, "test": {...}}, "summary": "..."}`

**Example**:
```bash
veridia verify --target ./src --type feature --level 2
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
