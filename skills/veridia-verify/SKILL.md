---
name: veridia-verify
description: Run a target checks and print a verdict.
---

Runs the verification checks (lint, typecheck, test, CI) appropriate for the given task type and verifiability level against a target directory. Returns a pass/fail verdict with details.

**Usage**: `veridia verify --target <path> --type <type> --level <level>`

**Example**:
```bash
veridia verify --target ./src --type feature --level 2
```
