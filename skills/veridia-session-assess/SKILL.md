---
name: veridia-session-assess
description: Assess target and write to session file.
---

Assesses verifiability of a target directory and writes the result (level, oracles) to .veridia/session.json. Advances session step to route. Requires an active session.

**Usage**: `veridia session-assess [--target <path>]`

**Example**:
```bash
veridia session-assess --target .
```
