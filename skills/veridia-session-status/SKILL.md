---
name: veridia-session-status
description: Show current session state and next suggested step.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Prints the current session state from `.veridia/session.json` and suggests the next command to run. Useful for checking progress in a step-by-step pipeline.

**Usage**: `veridia session-status`

**Output**: Human-readable summary of all session fields plus next step.

**Example**:
```
veridia session-status
  task       add user authentication
  type       feature  0.85
  level      2
  plan       tdd-where-possible  mid
  step       route
  next       session-route
```
