# veridia

**Model-agnostic quality through mechanics, not through the model.**

veridia is a personal "know-how" project. It is **not** a fork of warpweave/OpenSpec
(we keep the *method*, we rebuild the *code* from scratch). The core thesis:

> Quality comes from the process (triage + verifiable steps + self-measurement),
> not from which model you happen to plug in. veridia classifies a task, decides
> what can actually be verified, runs the cheapest sufficient model over it, and
> measures its own misses so it stops guessing blindly next time.

## The one-word identity: **triage**

veridia does not "understand you." It *sorts well*:
task → verifiability → process → model → check.

## Quick Start

### 1. Install

```bash
# From the veridia project directory
npm link

# Now you can use `veridia` from anywhere
veridia --help
```

### 2. Analyse a task

```bash
# veridia analyses your task description — it does NOT generate code
veridia "add user authentication"
```

Output example:
```
type    feature     0.29        ← task classification
level   3                       ← verifiability level (0-3)
plan    full-tdd   cheapest     ← recommended process
questions   none                ← clarifying questions
verdict    FAIL                ← check results
```

### 3. Analyse a specific project

```bash
# Point veridia at your project directory
veridia "fix login bug" --target /path/to/my-project
```

### 4. What the numbers mean

| Output | Meaning |
|--------|---------|
| `type` | bugfix / feature / refactor / doc / explore / open |
| `level` | **3** = tests + TypeScript + CI (full automated verification) |
| | **2** = partial verification (TypeScript or linter) |
| | **1** = human check only (no tests, no TypeScript) |
| | **0** = nothing detected |
| `plan` | full-tdd / tdd-where-possible / minimal / just-do-it |
| `verdict` | PASS / FAIL / HUMAN (requires manual review) |

### 5. Individual commands

```bash
# Classify a task
veridia classify "fix the null pointer crash"

# Assess verifiability of a target
veridia assess --target /path/to/repo

# Route (type, level) to a run plan
veridia route --type feature --level 2

# Ask clarifying questions (levels 0/1)
veridia ask --type feature --level 1

# Run a target's checks and print a verdict
veridia verify --target /path/to/repo --type feature --level 2

# Record a run outcome
veridia measure --record '{"task":"add auth","type":"feature","level":2,"verdict":"PASS","checks":[],"drift":""}'

# Print history summary
veridia measure --history
```

## Architecture

veridia implements six mechanisms in a triage pipeline:

```
INTENT ──▶ CLASSIFY ──▶ ASSESS ──▶ ROUTE ──▶ ASK? ──▶ VERIFY ──▶ MEASURE
             type        level       plan      clarify    check     learn
```

All mechanisms are deterministic, local-only for analysis, with optional AI model
integration for execution (via stdio or HTTP API).

## Docs index

- [Philosophy](docs/philosophy.md) — the why and the core thesis.
- [Mechanics](docs/mechanics.md) — the six mechanisms, the heart of the product.
- [Verifiability (the crux)](docs/verifiability.md) — how we decide, mechanically,
  whether a task can be verified (this is the deepest design problem we have).
- [Roadmap](docs/roadmap.md) — how we eat the elephant piece by piece.
- [Naming](docs/naming.md) — why "veridia" and what is reserved.
- [Reuse](docs/reuse.md) — what we copy / rewrite / skip from warpweave (the "not a fork" line).

## Status

All six mechanisms implemented. End-to-end triage loop operational.
