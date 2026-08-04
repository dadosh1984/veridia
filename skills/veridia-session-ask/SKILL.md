---
name: veridia-session-ask
description: Ask clarifying questions from session state.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Asks clarifying questions based on the session's type and level. Collects answers interactively and writes them to `.veridia/session.json`. Advances session step to `do`. Skips automatically when level >= 2.

**Usage**: `veridia session-ask`

**Output**: Interactive prompts followed by summary with answers and next step.

**Example**:
```
veridia session-ask
  ? What testing strategy do you use?
    1) unit tests only
    2) unit + integration
  > 2
  answer     q1: unit + integration
  step       do (next: session-do)
```
