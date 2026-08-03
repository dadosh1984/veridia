# veridia — Agent Instructions

veridia is a personal "know-how" project: a model-agnostic quality tool built
from scratch. Quality comes from process, not from the model. The workflow is
**triage**: classify → assess verifiability → route → ask? → do → verify → measure.

## Commandments

1. **No `src/` line copied from warpweave/OpenSpec.** We keep the method,
   rebuild the code. Any copied source file makes us a derivative work.
2. **Climb the Ponytail ladder before writing each line.** Stop at the first
   rung that holds: YAGNI → reuse → stdlib → native → dependency → one-liner →
   minimum. Mark deliberate simplifications `// ponytail: <reason>`.
3. **Follow TDD (RED-GREEN-REFACTOR).** Write a failing test, watch it fail,
   write minimal code, watch it pass.
4. **No code without an approved spec.** Specs live in `warpweave/changes/`.
5. **Verify each task before marking it done.** Run the task's `**Verify:**`
   command (RTK-wrapped).
6. **Run `rtk` on every shell command.** Compressed feedback; read tee logs at
   `~/.local/share/rtk/tee/` on failure.

## Development process (decided in docs/roadmap.md)

**Variant B — own ideas only.** No OpenSpec/warpweave lifecycle ceremony. We
dogfood veridia's own lightweight triage loop to build veridia itself. Ideas may
evolve during implementation; docs are a note-taking layer, not a hard gate.
Each stage ends with something testable before the next starts.

## Stage map

- Stage 0 — Foundations: repo, TS+ESM, CLI skeleton (`veridia --help`, `version`), CI.
- Stage 1 — Classify: task type heuristics.
- Stage 2 — Assess verifiability (the crux): probe repo → level 0–3.
- Stage 3 — Route: map (type, level) → model tier + orchestration.
- Stage 4 — Ask: clarifying questions when level is 0/1.
- Stage 5 — Execute + Verify: weighted verifier, gate on it.
- Stage 6 — Measure/learn: record drift, token/cost, outcomes.
- Stage 7 — Integration & polish.

See `docs/` for the full method (philosophy, mechanics, verifiability, roadmap,
reuse, naming).

## Commands

- Install: `pnpm install` (pnpm ≥ 9, Node ≥ 22.12).
- Build: `pnpm build` (build.js: clean `dist/` → tsc). Always build after
  editing `src/` — tests boot the compiled `dist/cli/index.js`.
- Verify order (mirrors CI): `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test`.
- Type check separately: `pnpm exec tsc --noEmit`.
- Tests: `pnpm test` (vitest). Focused file: `pnpm exec vitest run test/<file>.test.ts`.

## Windows is a first-class target

Never hardcode path separators; use `path.join(...)`. Never assume LF; trim
`\r\n` in test assertions. CI runs linux/macos/windows.

## Repo layout

- `src/cli/` — CLI entrypoint (`index.ts`, `version.ts`).
- `test/` — vitest suite (`helpers/run-cli.ts` boots the compiled CLI).
- `docs/` — the method (source of truth for product decisions).
- `warpweave/` — spec-driven planning artifacts (changes + specs).
