---
name: veridia-init
description: Initialize veridia config and agent command files.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Bootstraps a project with veridia configuration and agent-specific command files. Creates the necessary directory structure and default config for the specified agent.

**Input**: An agent name (e.g. "opencode", "claude").

**Usage**: `veridia init --agent <name>`

**Output**: `{"status": "<created|exists>", "files": ["...", "..."], "config": {...}}`

**Example**:
```bash
veridia init --agent opencode
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
