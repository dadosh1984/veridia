---
name: veridia-classify
description: Classify a task string into bugfix/refactor/feature/doc/explore/open.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Classifies a free-form task description into one of the supported task types using heuristics. The result drives downstream routing and verification strategy.

**Input**: A task string (e.g. "add login page" or "fix null pointer in parser").

**Usage**: `veridia classify <task>`

**Output**: `{"type": "<bugfix|refactor|feature|doc|explore|open>", "confidence": <0-1>}`

**Example**:
```bash
veridia classify "add login page"
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
