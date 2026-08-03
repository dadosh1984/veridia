## Context

veridia is a fresh, from-scratch TypeScript/ESM CLI project (see proposal.md — Why). Stage 0 must stand up a runnable shell with help/version behavior and CI before any product logic lands. The repo is a clean directory: only `docs/`, `README.md`, `AGENTS.md`, and the `warpweave/` planning scaffold exist. Constraints from `reuse.md`: copy generic tooling patterns, re-author everything product-related, never copy a warpweave `src/` line.

## Goals / Non-Goals

**Goals:**
- A `veridia` executable that satisfies the `cli` spec (help, version, unknown-arg handling, exit codes).
- Reproducible dev environment: `pnpm install` → `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test` all green on Windows, macOS, and Linux.
- Tests boot the compiled CLI in-process (fast, no subprocess flakiness) and assert on stdout/stderr/exit codes.
- ESM + strict TypeScript as the module system.

**Non-Goals:**
- No product mechanics (classify/assess/route/verify/measure) — later stages.
- No subcommand framework (commander etc.) — deferred to Stage 1.
- No npm publishing, no GitHub release wiring — out of scope for "foundations".
- No CLI arg parser beyond the handful of tokens Stage 0 needs.

## Decisions

### D1. Entrypoint layout: `src/cli/index.ts`, build → `dist/cli/index.js`
`package.json` `bin` maps `veridia` → `dist/cli/index.js`; `build.js` cleans `dist/` then runs `tsc`. Tests run against the built bundle, so a stale build fails loudly.
*Alternatives:* run TS directly via a loader — rejected (Node ≥ 22.12 + ESM loader churn, no benefit).

### D2. Hand-rolled arg parsing (no runtime dependency)
Parse `process.argv` directly: first non-flag token is a subcommand (`version`); flags are `--help`/`-h`, `-v`/`--version`, `--bogus` etc. Unknown tokens → stderr error + non-zero exit. This is a handful of `if/else` checks (rung 6), not a framework problem.
*Alternatives:* `commander` — rejected now (single command, no subcommand tree yet; ponytail rung 5 not needed).

### D3. Version from `package.json` via a single shared constant
A single source of truth for the version string used by `veridia version`, `--help` footer, and tests. `src/cli/index.ts` reads `package.json` (static import with `with { type: 'json' }` is awkward under ESM/NodeNext; instead a small module exports `version` string). To keep it mechanically correct, the value is read at build-time from package.json in `build.js`? — no, over-engineering (rung 7). Simplest correct: `src/cli/index.ts` imports a `version` constant from `src/cli/version.ts`; `build.js` is a plain clean+tsc script. Version bumps touch package.json + version.ts; CI parity test asserts they match.
*Alternative considered:* runtime `JSON.parse(fs.readFileSync(...))` of package.json — rejected (fs I/O on every invocation, path coupling to dist layout).

### D4. Exit codes: 0 success, 1 unknown argument
Spec requires 0 vs non-zero; pick `1` for the unknown-arg path. `process.exitCode` set explicitly, no `process.exit()` (lets stdout/stderr flush).

### D5. Test harness: in-process boot of the compiled CLI
A vitest helper that imports the built `dist/cli/index.js` entry after capturing argv/stdout/stderr, or spawns `node dist/cli/index.js` via `child_process`. Decide at task time: in-process is faster and cross-platform-safe (no PATH/binary resolution).
*Alternative:* exec the `bin` shim — rejected (Windows `.cmd` resolution flakiness).

### D6. CI matrix: linux-bash, macos-bash, windows-pwsh
`.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, lint, `tsc --noEmit`, build, test on the three OSes. Reuse the matrix pattern (reuse.md), re-written for veridia paths.

## Risks / Trade-offs

- [Version constant drifts from package.json] → `test/config-parity.test.ts`-style check asserts `version.ts` equals `package.json` version (D3).
- [Stale `dist/` makes tests pass against old code] → tests run only after `pnpm build`; CI order enforces build before test (D1, D6).
- [Windows path/newline differences in test assertions] → never hardcode separators; use `path.join`; trim `\r\n`; assert on substrings not full exact strings where portable.
- [Hand-rolled parsing grows unwieldy in Stage 1] → accepted trade-off; parser is ~15 lines and clearly scoped; swap to a framework when the first real subcommand lands.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Repo tooling (tsconfig/eslint/vitest/.gitignore/CI) | 2 — Reuse | Copy generic patterns from `reuse.md` COPY shelf, re-write paths/names |
| build.js | 2 — Reuse | Re-author the clean-dist→tsc pattern (not copied verbatim) |
| Arg parsing | 6 — One-liner | A few `process.argv` if/else checks; no framework |
| Version source | 3 — Stdlib | Read a shared `version.ts` constant; no fs/import machinery |
| Test harness | 3 — Stdlib | `node:child_process` / vitest in-process boot; no helper lib |
| Exit codes | 3 — Stdlib | `process.exitCode`; no exit-code library |

## Migration Plan

Not applicable — greenfield repo, nothing to migrate or roll back. Revert = delete the new files.

## Open Questions

None — deferrable unknowns would be things like exact help wording, which the spec intentionally leaves to implementation and tests assert only structurally.
