---
name: veridia-session-classify
description: Classify a task and write result to session file for step-by-step pipeline.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Classifies a task string and writes the result (type, confidence) to `.veridia/session.json`. Advances session step to `assess`. Use this for step-by-step pipeline execution.

**Input**: A task string (e.g. "add login page").

**Usage**: `veridia session-classify <task>`

**Output**: Human-readable summary with type, confidence, and next step.

**Example**:
```
veridia session-classify "add user authentication"
  type       feature      0.85
  step       assess (next: session-assess)
```

**Session file**: `.veridia/session.json` is created with `{task, type, confidence, step: "assess"}`.
