---
name: veridia-session-route
description: Build a run plan from session state.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Builds a run plan from the session's type and level. Writes the plan to `.veridia/session.json`. Advances session step to `ask`. Requires an active session with type and level.

**Usage**: `veridia session-route`

**Output**: Human-readable summary with plan depth, tier, and next step.

**Example**:
```
veridia session-route
  plan       tdd-where-possible  mid
  step       ask (next: session-ask)
```
