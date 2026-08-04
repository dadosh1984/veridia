---
name: veridia-session-assess
description: Assess verifiability of a target and write result to session file.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Assesses verifiability of a target directory and writes the result (level, oracles) to `.veridia/session.json`. Advances session step to `route`. Requires an active session (run session-classify first).

**Input**: Optional `--target <path>` flag. Defaults to current directory.

**Usage**: `veridia session-assess [--target <path>]`

**Output**: Human-readable summary with level, oracles, and next step.

**Example**:
```
veridia session-assess --target /path/to/project
  level      2
  oracles    test-runner, type-check
  step       route (next: session-route)
```
