---
name: veridia-execute
description: Execute a plan via the host agent.
---

Dispatches the execution plan to the host agent for implementation. The host agent carries out the steps defined by plan and reports results back through veridias verification pipeline.

**Usage**: `veridia execute --type <type> --level <level> [--files <files>] [--target <path>]`

**Example**:
```bash
veridia execute --type feature --level 2 --files src/foo.ts
```
