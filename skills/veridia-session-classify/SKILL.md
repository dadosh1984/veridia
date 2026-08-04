---
name: veridia-session-classify
description: Classify task and write to session file.
---

Classifies a task string and writes the result (type, confidence) to .veridia/session.json. Advances session step to assess. Use this for step-by-step pipeline execution.

**Usage**: `veridia session-classify <task>`

**Example**:
```bash
veridia session-classify "add user authentication"
```
