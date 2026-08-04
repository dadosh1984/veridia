## Why

veridia currently has two modes: full triage (`veridia <task>`) and individual commands (`veridia classify`, `veridia assess`, etc.). But there's no shared state between steps — each command is stateless. A user who runs `veridia classify "add auth"` then `veridia assess --target .` has to manually pass results between commands. An AI agent (Claude Code, OpenCode) has no way to resume a pipeline after asking a question.

This change introduces a session file (`.veridia/session.json`) that stores pipeline state between commands. Every command reads from and writes to the session, enabling step-by-step execution with shared context. The full pipeline (`veridia <task>`) also uses the session, stopping at `ask` to wait for user input and resuming from where it left off.

## What Changes

- **Session file**: `.veridia/session.json` stores task, type, confidence, level, plan, answers, verdict, and current step
- **Session-aware commands**: `veridia-classify`, `veridia-assess`, `veridia-route`, `veridia-ask`, `veridia-do`, `veridia-status`, `veridia-archive` all read/write session
- **Resumable pipeline**: `veridia <task>` runs full pipeline but persists session; if interrupted at `ask`, next `veridia <task>` resumes
- **Skill files**: Sync `skills/veridia-*/SKILL.md` with actual commands and session protocol
- **BREAKING**: `veridia <task>` now creates a session file instead of just printing JSON

## Capabilities

### New Capabilities
- `session`: Shared state file (`.veridia/session.json`) with read/write protocol
- `session-classify`: Classify task, write to session
- `session-assess`: Assess target, write to session
- `session-route`: Build plan from session, write to session
- `session-ask`: Ask questions from session, write answers to session
- `session-do`: Execute plan from session, verify, measure, write verdict
- `session-status`: Print current session state and next suggested step
- `session-archive`: Record session to history, clear session file

### Modified Capabilities
- `cli`: `veridia <task>` now uses session; new subcommands registered
- `triage`: Pipeline writes to session at each step; resumes from session if exists

## Impact

| Area | Impact |
|------|--------|
| `src/session/` | New module: `session.ts` (read/write/clear), `types.ts` (Session interface) |
| `src/cli/commands/` | New: `session-classify.ts`, `session-assess.ts`, `session-route.ts`, `session-ask.ts`, `session-do.ts`, `session-status.ts`, `session-archive.ts` |
| `src/cli/index.ts` | Register new commands, update USAGE |
| `src/triage/triage.ts` | Write session at each step; check for existing session on start |
| `skills/` | Sync all 13 skill files with session protocol |
| `test/` | New tests for session read/write, resume, step-by-step |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without session, step-by-step and AI-agent usage are impractical |
| Existing code reuse? | **Yes** — `history.ts` already reads/writes JSONL; session follows same pattern |
| Stdlib? | **Yes** — `fs.readFileSync`/`writeFileSync` for JSON persistence |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
