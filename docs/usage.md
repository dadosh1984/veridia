# Using veridia

A hands-on guide: how to apply veridia to a task, step by step.

## The one mental model

**One command runs the whole pipeline.** `veridia run "<task>"` moves through the
entire triage sequence and prints live progress as it goes:

```
veridia run "add user authentication"

→ classify: feature (0.29)        ← what kind of task
→ assess: level 3 · type-check, test-runner   ← how verifiable (0–3)
→ route: full-tdd / cheapest      ← chosen plan + model tier
→ ask: 0 question(s)              ← any clarifying questions
→ plan: 4 steps · 2 gates         ← the steps that will run
→ execute: delegated              ← doing the work
→ verify: HUMAN                   ← the verdict gate (PASS/FAIL/HUMAN)
→ measure: recorded               ← learning from this run
```

You don't juggle commands for a normal task — you hand veridia the task and it
applies its method: **classify → assess → route → ask → plan → execute → verify → measure.**

## One-time setup (per machine + per project)

```bash
# Install the CLI (Node ≥ 22.12)
npm install -g veridia

# In your project, wire veridia into your AI agent (run once)
cd /path/to/your-project
veridia init          # interactive: pick your agent(s), e.g. OpenCode, Claude Code
```

`veridia init` installs veridia **skills** and **slash commands** into the agent's
config directory (e.g. `.opencode/`). **Restart your agent chat** afterwards.

Then use veridia in two ways (details below).

## How to drive veridia from an AI-agent chat

1. **Just describe your task** — the agent uses the installed veridia skills and
   runs the pipeline. You can also be explicit:
2. **Run the command directly:**

   In the chat's terminal (bash):
   ```bash
   veridia run "your task description"
   ```
   As an OpenCode slash command:
   ```
   /veridia-run "your task description"
   ```
   For a bare JSON result (scripts/agents):
   ```bash
   veridia "your task description"
   ```

## One-shot vs step-by-step

| Mode | Commands | Use when |
|---|---|---|
| **One-shot** | `veridia run "<task>"` | your task is clear — just run it |
| **Step-by-step** | `veridia session-classify "<task>"` → `session-assess` → `session-route` → `session-ask` → `session-do` → `session-archive` | you want to inspect/control each stage; state persists in `.veridia/session.json` |

Check the current step at any time: `veridia session-status`.

## Command reference

| Command | What it does |
|---|---|
| `veridia <task>` / `run` | Full triage pipeline (JSON / human output) |
| `veridia classify <task>` | Classify task type (bugfix/feature/doc/refactor/explore/open) |
| `veridia assess --target <path>` | Assess verifiability level 0–3 + oracles |
| `veridia route --type <t> --level <l>` | Route to an orchestration plan |
| `veridia ask --type <t> --level <l>` | Get clarifying questions (levels 0/1) |
| `veridia plan --type <t> --level <l>` | Generate an execution plan |
| `veridia execute ...` | Delegate the plan to the host agent |
| `veridia verify --target <p> --type <t> --level <l>` | Run oracles, print verdict |
| `veridia measure --history` | History / learning summary |
| `veridia review --target <path>` | Output code-review instructions |
| `veridia learn` | Analyze history, produce recommendations |
| `veridia init` | Wire veridia into one or more AI agents |
| `veridia agents --list` | List the 35 supported agents |

## A complete first-run example

```bash
# 1. install
npm install -g veridia

# 2. set up for OpenCode in the project
cd my-app
veridia init --agent opencode

# 3. restart OpenCode, then run a task
veridia run "add dark mode to the settings page"
```

You'll see each `→` stage, then a verdict. That verdict (PASS / FAIL / HUMAN)
is veridia telling you how much it can trust its own check — and where a human
is still needed.

## Deeper reading

- [Mechanics](mechanics.md) — what the six mechanisms are
- [Verifiability](verifiability.md) — the level 0–3 model (the crux)
