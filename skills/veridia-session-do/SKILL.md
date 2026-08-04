---
name: veridia-session-do
description: Execute the plan from session state.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Executes the plan from the session: runs verification gates, records the verdict, and writes the result to `.veridia/session.json`. Advances session step to `done`. Also records the outcome to `.veridia/history.jsonl`.

**Usage**: `veridia session-do`

**Output**: Human-readable summary with verdict and next step.

**Example**:
```
veridia session-do
  verdict    PASS
  step       done (next: session-archive)
```
