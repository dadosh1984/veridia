## Context

See proposal.md — Why. Currently 20+ files use raw `process.stderr.write()` with inconsistent formatting. The fix is a single `src/util/log.ts` module that all code uses.

## Goals / Non-Goals

**Goals:**
- Single `log.ts` module with `info`, `warn`, `error`, `debug` functions
- JSON lines to stderr in non-TTY mode, human-readable in TTY mode
- Debug gated by `VERIDIA_DEBUG` env
- Replace all ad-hoc `process.stderr.write()` calls

**Non-Goals:**
- Not adding a logging framework dependency (pino/winston)
- Not changing stdout behavior (only stderr)
- Not adding log file rotation or persistence

## Decisions

### Decision 1: stdlib-only logger

A ~30-line module using `process.stderr.write`, `JSON.stringify`, `Date`, and `process.stderr.isTTY`. No dependencies.

Alternatives considered:
- **pino** (rung 5) — rejected: 30 lines of stdlib is enough for a CLI tool.
- **winston** (rung 5) — rejected: same reason.

### Decision 2: TTY detection via isTTY

`process.stderr.isTTY` determines format. In CI (non-TTY), JSON lines. In terminal, human-readable.

### Decision 3: gradual migration

Replace `process.stderr.write()` calls file by file, starting with the most frequent callers. The logger is additive — old calls can be migrated incrementally.

## Risks / Trade-offs

- [isTTY may be false in some terminal emulators] → Mitigation: JSON output is still valid and parseable; no data loss.
- [VERIDIA_DEBUG env may be forgotten] → Mitigation: documented in `docs/usage.md`.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Logger module | 3 (Stdlib) | `process.stderr.write`, `JSON.stringify`, `Date` |
| TTY detection | 3 (Stdlib) | `process.stderr.isTTY` |
| Debug gating | 3 (Stdlib) | `process.env.VERIDIA_DEBUG` |
