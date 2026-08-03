## Context

- See proposal.md - Why for motivation; specs/assess/spec.md for the behavior contract.
- Existing code: `src/cli/index.ts` is a flat argv dispatcher (additive branches per subcommand), `src/classify/` is a pure, deterministic, regex-based module with no I/O, tested against a fixture corpus. Stage 2 is the first subcommand that touches the filesystem.
- Constraints (AGENTS.md): TDD; stdlib only (no runtime deps); Windows-safe paths (`path.join`, no hardcoded separators); deterministic output; build = `pnpm build` (tsc → dist), tests boot compiled `dist/cli/index.js`.

## Goals / Non-Goals

**Goals:**
- A `src/assess/` module that probes a target directory and returns a level + oracle list, pure in the sense that filesystem probing is injectable for tests.
- Level derivation follows the mechanical rules in the spec (level 1 baseline, type-check/compiler → ≥2, tests covering target + deterministic task → 3).
- CLI branch `assess` matching the existing dispatch style; `--target` flag and positional path, default cwd.

**Non-Goals:**
- Mutation testing / verifier weighting (Stage 5/6), historical precision (Stage 6), or model-driven analysis.
- Deep language detection (which language/framework it is beyond what the probe needs).
- Interpreting "tests reference target files" beyond a shallow name/blame heuristic — the spec's wording is intentionally light; see Risks.

## Decisions

**D1. Module shape: `src/assess/assess.ts` + `src/assess/types.ts`.**
Follows the `classify` layout: pure logic in `src/assess/`, shared types in `types.ts`. The module exports `assess(target: string, fsLike?)` returning `{ level: VerifiabilityLevel; oracles: Oracle[] }`. The `fsLike` seam keeps tests fixture-free and on the Windows tmp dir.
- Alternatives: probe logic inline in the CLI (rejected — kills testability and mirror the `classify` precedent); a runtime dependency for repo detection (rejected, ladder rung 7).

**D2. Oracle detection is a fixed probe table.**
A declarative table maps oracle kinds to probe checks:
- test runner: `package.json` scripts (`test`), config files (`vitest.config.*`, `jest.config.*`, etc.);
- type-check: `tsconfig.json` presence, or compiled-language markers;
- lint: `eslint.config.*`, `.eslintrc*`, etc.;
- CI: `.github/workflows/*.yml`, `.gitlab-ci.yml`, etc.
Each check is `existsSync` on `path.join(target, rel)` plus a shallow regex sniff over small config files. `package.json` is only scanned up to a bounded size.
- Alternatives: parsing the full project graph (rejected — YAGNI at this stage).

**D3. Level mapping is a small pure function.**
`mapLevel(detections, task)` → level:
1. no oracles → `1` (human);
2. type-check/compiler present → at least `2`;
3. tests detected AND deterministic task AND tests plausibly cover the target → `3`.
A deterministic task is decided by the caller (Stage 1 `classify` later supplies it; for now `assess` accepts an optional `--type`/task hint and defaults deterministic to true when tests exist). Rationale: without a task signal the probe alone can't assert "full", so default determinism to true for tests→3 keeps the standalone probe useful.
- Alternatives: requiring a `--task` arg (rejected — `assess` must work standalone per spec Scenario "no target given"); never defaulting determinism (rejected — the spec's "tests covering target" scenario expects level 3 without extra input).

**D4. Output format matches `classify`: tab-separated, single line.**
`<level>\t<oracleKind>,<oracleKind>,...` and exit 0; missing target → stderr + exit 1. Consistent with the existing `type\tconfidence` contract and the trivial USAGE/exit conventions already tested.
- Alternatives: JSON output (rejected — heavier than the current CLI's style; nothing downstream consumes JSON yet).

## Risks / Trade-offs

- [Shallow "tests cover target" heuristic can over/under-claim coverage] → Mitigation: word the oracle as "test runner detected" (fact) and only claim level 3 when a test runner plus deterministic task both hold; deep coverage analysis is explicitly deferred to the verifier stage.
- [Large config files / node_modules noise] → Mitigation: probe whitelists specific paths and caps file reads; never walk `node_modules`.
- [Determinism default could hide an exploratory task] → Mitigation: `assess` accepts an optional task/type hint to force deterministic=false; the route/ask stages (3–4) refine this later.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Probe table | 7 Minimum | Fixed declarative existsSync + bounded regex table; no repo-analysis dependency |
| Filesystem access | 3 Stdlib | `node:fs`/`node:path` only |
| CLI dispatch | 2 Reuse | New `assess` branch in existing `src/cli/index.ts` |
| Level mapping | 3 Stdlib | Small pure function; no rule engine |
| Output format | 2 Reuse | Tab-separated single line, mirrors `classify` |
| Test fixtures | 3 Stdlib | In-memory `fsLike` seam + tmp-dir files, no fixture repo |
