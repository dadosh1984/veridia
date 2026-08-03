## Why

veridia is in the design phase — docs exist, no code. Stage 0 is the foundation:
a clean repo and a runnable CLI skeleton so later stages (classify, assess,
route, ask, verify, measure) have a home and CI that catches regressions. We
keep the method but build the code from scratch; `reuse.md`'s not-a-fork rule
means no `src/` file is copied from warpweave.

## What Changes

- Create the veridia repo structure from scratch: `package.json`
  (pnpm ≥ 9 / Node ≥ 22.12, ESM), `tsconfig.json`, `eslint.config.js`,
  `vitest.config.ts`, `build.js`.
- CLI skeleton: single `veridia` command with `veridia --help` and
  `veridia version`.
- Build pipeline: clean `dist/` → `tsc`.
- Test scaffold: a focused vitest suite that boots the compiled CLI in-process.
- CI scaffold: lint → tsc → build → test on a linux/macOS/Windows matrix.
- **No** product logic yet (classify/assess/route come in later stages).
- **No** `src/` line copied from warpweave (the not-a-fork boundary).

## Capabilities

### New Capabilities
- `cli`: the veridia command-line entrypoint — `veridia --help`, `veridia version`, and no-args / unknown-arg behavior.

### Modified Capabilities

<!-- None — veridia has no existing specs. -->

## Impact

- New files at repo root: `package.json`, `tsconfig.json`, `eslint.config.js`,
  `vitest.config.ts`, `build.js`, `src/cli/index.ts`, test files,
  `.github/workflows/ci.yml`, `.gitignore`, `.gitattributes`, `LICENSE`,
  `SECURITY.md`, `AGENTS.md`.
- No existing code is touched (design-phase repo, no `src/` yet).
- Dependencies: dev-only — `typescript`, `vitest`, `eslint`, `@types/node`.
  No runtime dependencies (stdlib arg parsing).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — veridia needs a runnable shell; later stages need a home. Scope held to the Stage 0 DoD: `--help` works, tests green. No classify/assess/route logic yet. |
| Existing code reuse? | Copy generic tooling patterns from the COPY shelf of `reuse.md` (tsconfig/eslint/vitest/CI matrix conventions, `.gitignore`, `.gitattributes`, LICENSE/SECURITY patterns). Re-author `build.js`. Do NOT copy warpweave `src/`. |
| Stdlib? | Node stdlib `process.argv` parses `--help`/`version`; `node:child_process` spawns the CLI in tests. |
| Native platform? | `package.json` `bin` + shebang provides the executable; no platform-specific code (paths built with `path.join` for Windows safety). |
| New dependency? | Dev-only tooling: `typescript`, `vitest`, `eslint`, `@types/node` — required, no runtime alternative. No runtime dependency: a CLI framework (e.g. commander) is deferred to Stage 1 when real subcommands exist (rung 6: a few `argv` checks suffice today). |

## Complexity

Complexity: **normal** — 4+ new files, new component (`src/cli/`), new public behavior (the `veridia` command). Full chain: proposal → specs → design → tasks.
