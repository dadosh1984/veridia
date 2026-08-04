---
name: veridia-plan
description: Generate an execution plan for the host agent.
---

Produces a structured execution plan that a host AI agent can follow. The plan includes steps, verification gates, and file targets based on the task type and verifiability level.

**Usage**: `veridia plan --type <type> --level <level> [--files <files>] [--target <path>]`

**Example**:
```bash
veridia plan --type feature --level 2 --files src/foo.ts
```
