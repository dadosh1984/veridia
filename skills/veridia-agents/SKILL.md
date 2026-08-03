---
name: veridia-agents
description: List all supported AI agents.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Lists all AI agents that veridia supports for plan execution and code review. Each agent entry includes its name, model tier, and capabilities.

**Input**: The `--list` flag.

**Usage**: `veridia agents --list`

**Output**: `{"agents": [{"name": "...", "tier": "...", "capabilities": ["..."]}]}`

**Example**:
```bash
veridia agents --list
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
