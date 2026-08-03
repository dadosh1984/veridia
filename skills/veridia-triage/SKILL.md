---
name: veridia-triage
description: Run the full triage loop on a task string.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Runs the complete veridia triage loop on a task string: classify → assess → route → ask (if needed) → plan → execute → verify → measure. This is the primary entry point for end-to-end usage.

**Input**: A task string, optional target path, and optional auto flag.

**Usage**: `veridia <task> [--target <path>] [--auto]`

**Output**: `{"type": "...", "level": <0-3>, "plan": {...}, "verdict": "<pass|fail>", "measurement": {...}}`

**Example**:
```bash
veridia "add login page" --target ./src --auto
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
