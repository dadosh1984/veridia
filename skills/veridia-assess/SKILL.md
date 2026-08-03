---
name: veridia-assess
description: Assess verifiability of a target directory.
allowed-tools: Bash(veridia:*)
license: MIT
compatibility: Requires veridia CLI.
metadata:
  author: veridia
  version: "1.0"
---

Probes a target directory for test frameworks, lint configs, type-checking setup, and CI files to determine a verifiability level (0–3). Level 0 means no automated checks; level 3 means comprehensive checks exist.

**Input**: A target directory path and optional task type hint.

**Usage**: `veridia assess --target <path> [--type <type>]`

**Output**: `{"level": <0|1|2|3>, "checks": ["lint", "typecheck", "test", "ci"], "evidence": {...}}`

**Example**:
```bash
veridia assess --target ./src --type feature
```

**Guardrails**
- All output is JSON
- Exit code 0 on success, non-zero on error
- Errors go to stderr
