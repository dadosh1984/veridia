---
name: veridia-assess
description: Assess verifiability of a target directory.
---

Probes a target directory for test frameworks, lint configs, type-checking setup, and CI files to determine a verifiability level (0-3). Level 0 means no automated checks; level 3 means comprehensive checks exist.

**Usage**: `veridia assess --target <path> [--type <type>]`

**Example**:
```bash
veridia assess --target ./src --type feature
```
