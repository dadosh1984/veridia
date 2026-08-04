## Context

See `proposal.md`. The current pipeline is stateless — each command runs independently. This change adds a session file (`.veridia/session.json`) that stores pipeline state between commands, enabling step-by-step execution and AI-agent resumability.

## Decisions

### 1. Session file: JSON, not JSONL

| Alternative | Verdict |
|------------|---------|
| JSONL (append-only, like history) | **Rejected** — session is a single state, not a log |
| JSON (single object, overwritten) | **Chosen** — simple read/write, matches history.ts pattern |

### 2. Session path: `.veridia/session.json`

Reuses existing `.veridia/` directory (same as `config.json`, `history.jsonl`). No new directory needed.

### 3. Step enum: classify → assess → route → ask → do → done

Each step maps to a command. The `step` field controls what `veridia <task>` does when resuming.

### 4. Resume logic in triage.ts

When `veridia <task>` runs and a session exists with `step !== 'done'`, skip completed steps and resume from current step. This makes the full pipeline resumable after `ask`.

### 5. Commands are thin wrappers

Each `session-*` command reads session, calls the existing core function, writes session, advances step. No new core logic — just orchestration.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  .veridia/session.json                                │
│  {                                                    │
│    task, type, confidence, level, plan,               │
│    answers, verdict, step                             │
│  }                                                    │
└──────────────────────┬───────────────────────────────┘
                       │
  ┌────────────────────┼────────────────────┐
  │                    │                    │
  ▼                    ▼                    ▼
┌─────────┐     ┌───────────┐     ┌──────────────┐
│ veridia │     │ veridia   │     │ AI Agent     │
│ <task>  │     │ session-* │     │ (skill .md)  │
└────┬────┘     └─────┬─────┘     └──────┬───────┘
     │                │                   │
     └────────────────┼───────────────────┘
                      ▼
             ┌────────────────┐
             │  session.ts    │
             │  read/write    │
             └────────┬───────┘
                      │
             ┌────────▼────────┐
             │  Core functions │
             │  classify()     │
             │  assess()       │
             │  buildPlan()    │
             │  ask()          │
             │  verify()       │
             │  measureRecord()│
             └─────────────────┘
```

## Tasks

- [ ] 1.1 Create `src/session/types.ts` — Session interface
- [ ] 1.2 Create `src/session/session.ts` — readSession, writeSession, clearSession
- [ ] 1.3 Create `src/cli/commands/session-classify.ts`
- [ ] 1.4 Create `src/cli/commands/session-assess.ts`
- [ ] 1.5 Create `src/cli/commands/session-route.ts`
- [ ] 1.6 Create `src/cli/commands/session-ask.ts`
- [ ] 1.7 Create `src/cli/commands/session-do.ts`
- [ ] 1.8 Create `src/cli/commands/session-status.ts`
- [ ] 1.9 Create `src/cli/commands/session-archive.ts`
- [ ] 1.10 Modify `src/triage/triage.ts` — resume from session if exists
- [ ] 1.11 Modify `src/cli/index.ts` — register new commands, update USAGE
- [ ] 1.12 Sync `skills/veridia-*/SKILL.md` with session protocol
- [ ] 1.13 Test: full pipeline step-by-step via session commands
- [ ] 1.14 Test: resume after ask interruption
