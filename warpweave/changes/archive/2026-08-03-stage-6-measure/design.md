## Context

See proposal.md — Why. The triage loop has 5 mechanisms; 4 are implemented. The 5th (measure) is missing. The existing `verify` module returns a `VerifyResult` that measure can consume directly. The CLI dispatcher in `src/cli/index.ts` uses flat `if/else if` branches — the `measure` branch will follow the same pattern.

## Goals / Non-Goals

**Goals:**
- Record run outcomes (task, type, level, verdict, checks, drift) to a local JSONL file
- Surface history summary (total runs, per-verdict, per-level, recent entries)
- Deterministic, local-only, zero new dependencies

**Non-Goals:**
- No external model calls or network requests
- No data analysis beyond simple counts and recent entries
- No integration with external analytics or telemetry

## Decisions

1. **JSONL format over SQLite or JSON array** — JSONL is append-only (no read-modify-write), stdlib only (`node:fs`), human-readable, and trivially grep-able. SQLite would add a dependency; JSON array requires rewriting the whole file on each append.

2. **`.veridia/` directory over project root** — Keeps history data contained and easy to gitignore. Follows `.vercel/`, `.next/` convention.

3. **Flat CLI branch over commander/yargs** — The existing CLI uses flat `if/else if` dispatch with zero dependencies. Adding a `measure` branch follows the same pattern (ponytail: reuse existing pattern).

4. **Separate `types.ts`, `measure.ts`, `history.ts`** — Follows the existing module structure in `src/verify/` (types, orchestration, helpers). Keeps concerns separated.

## Risks / Trade-offs

- [Risk] JSONL file grows unbounded → Mitigation: `--history` could add a `--prune <N>` flag in a future change; for now the file is small enough (each entry <1KB, thousands of runs <1MB)
- [Risk] Timestamp collision on rapid records → Mitigation: use ISO 8601 with milliseconds; collisions are harmless (append-only, each line is independent)

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| History file format | 3 (Stdlib) | `node:fs` appendFileSync + JSON.stringify — no dependency needed |
| CLI dispatch | 2 (Reuse) | Same flat `if/else if` pattern as existing branches |
| Module structure | 2 (Reuse) | Same `types.ts` + `measure.ts` + `history.ts` pattern as `src/verify/` |
| Directory convention | 4 (Native) | `.veridia/` — no library, just a path convention |
