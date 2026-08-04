---
name: veridia-triage
description: Run the full triage loop on a task string.
---

Runs the complete veridia triage loop on a task string: classify, assess, route, ask (if needed), plan, execute, verify, measure. This is the primary entry point for end-to-end usage.

**Usage**: `veridia <task> [--target <path>] [--auto]`

**Example**:
```bash
veridia "add login page" --target ./src --auto
```
