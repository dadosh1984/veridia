---
name: veridia-intro
description: How to apply veridia to a task (onboarding).
---

veridia applies a deterministic quality method to a task: **classify → assess →
route → ask → plan → execute → verify → measure**. Quality comes from the
process, not which model is used.

## Two ways to run veridia

1. **One-shot (recommended)** — the whole pipeline, with live progress:
   ```bash
   veridia run "<task description>"
   ```
   example: `veridia run "add user authentication"`
   You will see `→`-stage lines and a final verdict (PASS / FAIL / HUMAN).

2. **Step-by-step (session)** — control each stage; state persists in
   `.veridia/session.json`:
   ```bash
   veridia session-classify "<task>"   # type
   veridia session-assess              # verifiability level 0–3
   veridia session-route               # plan
   veridia session-ask                 # clarifying questions (levels 0/1)
   veridia session-do                  # execute + verify
   veridia session-archive             # record to history
   ```
   Check progress anytime: `veridia session-status`.

## Quick reference

| Command | Purpose |
|---|---|
| `veridia run "<task>"` | full pipeline (human output) |
| `veridia <task>` | full pipeline (JSON output) |
| `veridia classify <task>` | task type |
| `veridia assess --target <path>` | verifiability level 0–3 |
| `veridia route --type <t> --level <l>` | orchestration plan |
| `veridia ask --type <t> --level <l>` | clarifying questions |
| `veridia verify --target <p> --type <t> --level <l>` | run oracles + verdict |
| `veridia measure --history` | learning summary |
| `veridia init` | wire veridia into your AI agent |

## When to use me

Use this when the user is unsure how to start a task with veridia in a new
project, or asks "what command do I run?". If they say "just do it", guide them
to `veridia run "<task>"`. Full guide: `docs/usage.md`.
