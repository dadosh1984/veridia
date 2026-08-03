---
name: veridia-generate
description: Generate agent command files.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Generates or regenerates agent-specific command files (e.g. `.opencode/commands.json`) for the specified agent. Useful after updating veridia to get the latest command definitions.

**Input**: An agent name (e.g. "opencode", "claude").

**Usage**: `veridia generate --agent <name>`

**Output**: `{"status": "<generated|exists>", "files": ["...", "..."], "commands": {...}}`

**Example**:
```bash
veridia generate --agent opencode
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
