---
name: veridia-session-archive
description: Archive completed session to history and clear session file.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Records the completed session to `.veridia/history.jsonl` and deletes `.veridia/session.json`. Only works when session step is `done`. Run after session-do.

**Usage**: `veridia session-archive`

**Output**: Confirmation message.

**Example**:
```
veridia session-archive
  Session archived to history.
```
