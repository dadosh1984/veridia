# veridia

[![CI](https://github.com/dadosh1984/veridia/actions/workflows/ci.yml/badge.svg)](https://github.com/dadosh1984/veridia/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/veridia.svg)](https://www.npmjs.com/package/veridia)
[![npm downloads](https://img.shields.io/npm/dm/veridia.svg)](https://www.npmjs.com/package/veridia)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Model-agnostic quality through mechanics, not through the model.**

veridia is a CLI tool that classifies a task, assesses how verifiable it is, routes it to the cheapest sufficient process, runs verification gates, and measures its own misses — so it stops guessing blindly next time.

```bash
npm install -g veridia
veridia "add user authentication"
```

## Why veridia?

Quality comes from the process, not from which model you happen to plug in. veridia implements a deterministic triage pipeline:

```
TASK → CLASSIFY → ASSESS → ROUTE → ASK? → VERIFY → MEASURE
       type       level     plan    clarify  check    learn
```

Every mechanism is local, deterministic, and testable. AI model integration is optional — used only for execution, never for analysis.

## Quick Start

### Install

```bash
# Global install
npm install -g veridia

# Local install
npm install veridia
npx veridia --help
```

Requires **Node ≥ 22.12**.

### Run a task

```bash
# Analyse a task description
veridia "fix login timeout"

# Analyse a specific project
veridia "add dark mode" --target /path/to/project

# Full triage loop with human-readable output
veridia run "add user authentication"
```

### Output

```json
{
  "type": "feature",
  "confidence": 0.29,
  "level": 3,
  "plan": { "depth": "full-tdd", "tier": "cheapest" },
  "verdict": "FAIL"
}
```

| Field | Meaning |
|-------|---------|
| `type` | bugfix / feature / refactor / doc / explore / open |
| `level` | 0–3 verifiability (3 = tests + TS + CI) |
| `plan` | full-tdd / tdd-where-possible / minimal / just-do-it |
| `verdict` | PASS / FAIL / HUMAN (needs manual review) |

## Commands

| Command | Description |
|---------|-------------|
| `veridia <task>` | Full triage pipeline (JSON output) |
| `veridia run <task>` | Full triage with human-readable output |
| `veridia classify <task>` | Classify task type |
| `veridia assess --target <path>` | Assess verifiability level 0–3 |
| `veridia route --type <t> --level <l>` | Route to orchestration plan |
| `veridia ask --type <t> --level <l>` | Get clarifying questions |
| `veridia plan --type <t> --level <l>` | Generate execution plan |
| `veridia verify --target <p> --type <t> --level <l>` | Run verification gates |
| `veridia fix --target <p> [--dry-run] [--force]` | Auto-fix console.log/TODO |
| `veridia measure --history` | History summary |
| `veridia learn` | Analyse history, recommendations |
| `veridia develop --change <name>` | Dogfooding: run triage against a change |
| `veridia init` | Wire veridia into AI agents |
| `veridia agents --list` | List supported agents |

### Streaming output

```bash
# See gate output in real-time
veridia verify --verbose --target . --type refactor --level 3
veridia run --verbose "fix login bug"
```

### Debug logging

```bash
VERIDIA_DEBUG=1 veridia run "add auth"
```

## Architecture

veridia is built around six deterministic mechanisms:

1. **Classify** — pattern-based task type detection (bugfix/feature/refactor/doc/explore/open)
2. **Assess** — probe target repo for tests, type-check, lint, CI → verifiability level 0–3
3. **Route** — map (type, level) → orchestration depth + model tier
4. **Ask** — generate clarifying questions when level is 0/1
5. **Verify** — run gates (vitest, tsc, lint), weigh results, derive verdict
6. **Measure** — record outcomes, compute precision, detect drift

All mechanisms are deterministic and unit-testable. AI models are optional and only used for execution.

## Security

When no AI model is configured, `run`/`execute` may delegate verification gates to the local shell. Control this with:

```bash
VERIDIA_SHELL_DELEGATION=deny veridia run "..."
VERIDIA_SHELL_DELEGATION=ask veridia run "..."
```

## Docs

- [Usage](docs/usage.md) — setup, commands, session mode
- [Mechanics](docs/mechanics.md) — the six mechanisms
- [Verifiability](docs/verifiability.md) — the level 0–3 model
- [Roadmap](docs/roadmap.md) — project status and plans

## License

MIT
