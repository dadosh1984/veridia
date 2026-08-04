---
name: veridia-session-do
description: Execute plan from session state.
---

Executes the plan from the session: runs verification gates, records the verdict, and writes the result to .veridia/session.json. Advances session step to done. Also records the outcome to .veridia/history.jsonl.

**Usage**: `veridia session-do`

**Example**:
```bash
veridia session-do
```
