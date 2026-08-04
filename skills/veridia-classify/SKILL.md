---
name: veridia-classify
description: Classify a task string into bugfix/refactor/feature/doc/explore/open.
---

Classifies a free-form task description into one of the supported task types using heuristics. The result drives downstream routing and verification strategy.

**Usage**: `veridia classify <task>`

**Example**:
```bash
veridia classify "add login page"
```
