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

**Install from npm** (the published package):

```bash
# Global — use `veridia` from any directory
npm install -g veridia

# Local — only inside one project (run via npx, not `veridia` directly)
npm install veridia
npx veridia --help
```

> **Note:** a *local* `npm install veridia` does **not** put a `veridia` command on your
> PATH. Use `npx veridia` there, or add a `package.json` script:
> `"scripts": { "quality": "veridia \"add auth\"" }`.

**From the source tree (development):**

```bash
npm link
veridia --help
```

Requires **Node ≥ 22.12**.

### 1.1 Set up for your AI agents

`veridia init` wires veridia into one or more of the 35 supported AI agents (OpenCode, Claude Code, Cursor, Codex, ...):

```bash
# interactive: pick one or more agents from a checklist
veridia init

# non-interactive / scripting / CI:
veridia init --agent opencode
veridia init --agent opencode --agent claude
```

Run it in the project root that holds the agent's config directory (`.opencode/`, `.claude/`, ...). For each selected agent `init`:

- installs the bundled veridia **skills** (`skills/veridia-*`) into `. <configDir>/skills/`, and
- generates **slash commands** (`veridia-classify`, `veridia-triage`, ...) for agents with a command surface.

After `init`, **restart your agent** for the new commands/skills to take effect. The checklist is skipped automatically when stdin is not a terminal (then `--agent <id>` is required); use `--no-interactive` to force this. List supported agents with `veridia agents --list`.

### 2. Analyse a task

```bash
# veridia analyses your task description — it does NOT generate code
veridia "add user authentication"
```

Output example:
```json
{
  "type": "feature",
  "confidence": 0.29,
  "level": 3,
  "plan": { "depth": "full-tdd", "tier": "cheapest" },
  "verdict": "FAIL"
}
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
