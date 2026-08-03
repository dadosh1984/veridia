## Context

See proposal.md — Why. All 6 mechanisms exist as standalone modules. The triage orchestrator chains them in sequence: classify → assess → route → ask? → verify → measure. The CLI dispatcher currently rejects unknown subcommands — the end-to-end mode repurposes that fallthrough to treat unrecognized args as a task string.

## Goals / Non-Goals

**Goals:**
- Single `veridia <task>` command runs the full triage loop
- Each step feeds its output into the next (classify output → assess input, etc.)
- Outcome recorded via existing `measureRecord`
- README updated with current status and usage

**Non-Goals:**
- No new mechanisms or behavior changes to existing modules
- No external model integration (still deterministic-only)
- No interactive mode — ask questions are printed but not answered (deferred to future)

## Decisions

1. **Sequential orchestration over event-driven** — The loop is linear (classify → assess → route → ask → verify → measure). A simple sequential function call is the clearest implementation. Event-driven would add complexity with no benefit.

2. **CLI fallthrough over new subcommand** — `veridia "add dark mode"` reads naturally. The existing `else` branch (unknown subcommand) is repurposed: if the arg doesn't match a known subcommand or flag, treat it as a task string. This is a one-line change in the dispatcher.

3. **Ask questions printed but unanswered** — The ask module returns questions. For now they are printed to stdout. Interactive answering is deferred (would require stdin reading and a loop).

4. **README update over separate docs** — The README is the project's front door. Updating it with current status, architecture, and usage is the minimum viable documentation.

## Risks / Trade-offs

- [Risk] CLI fallthrough changes behavior: `veridia unknown` previously errored, now runs triage → Mitigation: only fallthrough for args that don't start with `--` and aren't known subcommands. Flags like `--bogus` still error.
- [Risk] Ask questions printed but ignored → Mitigation: clearly documented as "questions printed; answer them yourself for now"

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Triage orchestrator | 2 (Reuse) | Chains existing modules — no new logic |
| CLI fallthrough | 2 (Reuse) | Repurposes existing `else` branch |
| README update | 2 (Reuse) | Edits existing file, no new docs infra |
