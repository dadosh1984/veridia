# veridia

## 0.12.0

### Minor Changes

- bae7019: build: migrate from `tsup` to `tsdown` (Rolldown-based)

  - Replace `tsup` (esbuild) with `tsdown` (Rolldown). Build is roughly 2–3× faster in dev and noticeably faster on CI cold builds.
  - ESM output is now `*.mjs` instead of `*.js` (correct Node ESM convention).
  - `bin` entries updated to `dist/cli/index.mjs` and `dist/mcp/index.mjs`.
  - Test helpers (`test/helpers/run-cli.ts`, `test/mcp.test.ts`) and `vitest.setup.ts` updated for the new extension.
  - Bundle sizes stay within budget:
    - CLI: 92.6 KB → 103.3 KB raw / 21.7 KB → 25.7 KB gzip
    - MCP: 559.8 KB → 499.2 KB raw / 105.5 KB → 103.2 KB gzip

### Patch Changes

- bae7019: ci: harden GitHub Actions workflow

  - Expand Node matrix from `22.13` to `22.13` + `24.x` (current LTS).
  - Split the single `test` job into `install`, `lint`, `typecheck`, `test` for parallel execution.
  - Add `actions/cache@v4` for the pnpm store (Linux, macOS, Windows paths).
  - Bump `actions/checkout` from `v4` to `v6` (consistent with `opencode.yml`).
  - Add non-blocking `pnpm audit --prod` step (`continue-on-error: true`).
  - Add zero-dependency bundle-size guard at `scripts/check-size.mjs` (CLI 25.7 KB / MCP 103.2 KB gzip, limit 250 KB).
  - Tighten `vitest` coverage thresholds from `50/40/60/55` to `65/58/62/65` (actual coverage 68.06 / 60.42 / 64.98 / 69.9).
  - Add `pnpm size` script.

- bae7019: refactor(cli): declarative command registry

  - Extract cac command registration into `src/cli/registry.ts` with a typed `CommandDef` data shape and `registerAll` helper.
  - Rewrite `src/cli/index.ts` as a flat list of `CommandDef` literals (29 commands) plus three inline special cases (`version`, `completion`, default `[task]`).
  - The `cli.parse()` call is preserved in a `try/catch` (carries over the existing clean-error behaviour from `e7c0137`).
  - Adding a new CLI command is now: append one literal to the `commands` array.
  - No public-API or behaviour change: all 32 commands register identically (verified by `veridia --help`, `veridia version`, and 340/340 tests).
  - Internal `AnyFunction` type in `registry.ts` documents that cac signatures are erased at the boundary — handlers are still fully type-checked at the call site.

## 0.11.0

### Minor Changes

- feat: e2e dogfooding loop — `veridia develop --change/--self` runs full triage pipeline against a change
- feat: streaming gate output with `--verbose` flag on `run`, `verify`, `develop`
- feat: structured logging with levels (info/warn/error/debug), JSON in non-TTY, human-readable in TTY
- feat: MCP surface parity — 12 new tools (route, ask, measure, report, review, session\_\*)
- fix: AST-based auto-fix with dry-run, force, and git-dirty guard
- fix: capture child stdout in exec-shim, route to stderr in machine mode
- fix: replace shell:true Windows fallback with PATHEXT-based shim resolution
- fix: report corrupt history lines to stderr instead of silent catch
- fix: sync MCP server version with package.json
- chore: OSS hygiene — badges, provenance, Renovate
- chore: remove foreign files from tracking (.claude, .changeset, schemas, skills, warpweave)

## 0.10.0

### Minor Changes

- fix: repair CI — pnpm install no longer fails (pnpm 11 aligned across local and CI, broken workspace `packages` requirement removed)
  fix: build via tsup instead of undeclared bun runtime; `build`, `typecheck`, and `prepublishOnly` now run on plain Node
  fix: `run`, `verify`, and the bare task command now exit non-zero on a FAIL verdict (usable as a CI gate)
  fix: orchestrate treats HUMAN verdicts as success (no wasted model retries on level 0/1) and tracks the best A/B result
  fix: session resume re-derives oracle kinds instead of verifying with an empty list
  fix: classify no longer crashes on an invalid regex in `.veridia/config.json`
  fix: `veridia pr` uses execFileSync (no shell injection via `--base`)
  fix: collect-files protects against symlink cycles
  fix: split-command preserves Windows paths, escapes, and empty quoted args
  fix: report uses the real version and escapes HTML
  fix: learn feedback loop tolerates missing `classify.patterns` and invalid stored regexes
  fix: removed duplicate interface and dead mutation block in verify

## 0.9.0

### Minor Changes

- feat: knip/oxc oracles (dead-code, bundler) in assess and verify
  feat: A/B model testing in orchestrate (accepts a single ModelConfig or an array)
  feat: feedback loop in learn — auto-adds classification patterns to .veridia/config.json on low accuracy
  fix: BOM tolerance when reading .veridia/config.json

## 0.8.0

### Minor Changes

- a3e5d72: feat: JSR publish config and module entry point
  feat: time-to-fix metric (durationMs in triage and learn)
  feat: veridia ci � generate CI config (GitHub Actions, GitLab CI, CircleCI)
  feat: veridia benchmark � performance benchmarking
  feat: veridia pr � analyze pull requests with triage
  feat: veridia report � Markdown/HTML quality report
  feat: self-dogfooding in CI
  feat: mutation testing in verify pipeline
  feat: veridia fix � auto-fix console.log and TODO

## 0.7.0

### Minor Changes

- 37a89dd: feat: veridia ci � generate CI config (GitHub Actions, GitLab CI, CircleCI)
  feat: veridia benchmark � performance benchmarking
  feat: veridia pr � analyze pull requests with triage
  feat: veridia report � Markdown/HTML quality report
  feat: self-dogfooding in CI
  feat: mutation testing in verify pipeline
  feat: veridia fix � auto-fix console.log and TODO

## 0.6.0

### Minor Changes

- 88df3b3: feat: veridia pr � analyze pull requests with triage
  feat: veridia report � generate Markdown/HTML quality report
  feat: self-dogfooding in CI (full triage, analysis, verify, learn, measure)
  feat: mutation testing auto-wired into verify pipeline
  feat: veridia fix � auto-fix console.log and TODO comments

## 0.5.0

### Minor Changes

- d4cffbf: feat: veridia report � generate Markdown/HTML quality report

## 0.4.0

### Minor Changes

- a37c5ee: feat: self-dogfooding in CI (full triage, analysis, verify, learn, measure)
  feat: mutation testing auto-wired into verify pipeline
  feat: veridia fix � auto-fix console.log and TODO comments

## 0.3.0

### Minor Changes

- 80c7ffd: feat: veridia fix � auto-fix console.log and TODO comments

## 0.2.0

### Minor Changes

- af22b24: feat: Biome linter (10x faster than ESLint)
  feat: Shell completion (bash/zsh/fish)
  feat: JSDoc on all 42 public API files
  feat: TUI for veridia run (@clack/prompts)
  feat: Type guards instead of unsafe casts
  feat: MCP Server (veridia-mcp)
  feat: TypeScript strictest mode (noUncheckedIndexedAccess)
  feat: Init wizard (interactive project setup)
  feat: Watch mode (live triage on file changes)
  feat: Pipeline pattern (Chain of Responsibility)
  feat: Bun runtime for build (5x faster)
  feat: JSON Schema protocol validation
  feat: Dashboard (local web UI on port 3030)

## 0.1.8

### Patch Changes

- 4dee16e: Fix: delegate.ts � use execFileWithShim for Windows compat, fix error type assertion
  Fix: session-do.ts � human-review mapped to correct OracleKind, use CHECK_TO_KIND map
  Fix: triage.ts � remove clearSession before triage (was breaking session resume)
  Fix: triage.ts � consolidate 3 writeSession calls into 1
  Fix: split-command.ts � handle escaped quotes, tabs
  Fix: exec-shim.ts � quote paths with spaces for Windows shell fallback, preserve stderr
  Fix: checkbox-select.ts � add timeout + cleanup to prevent memory leak
  Fix: shared.ts � remove dead parseFlags function
  Fix: config.ts � add eslint.config.mjs to lint probes (sync with probe.ts)

## 0.1.7

### Patch Changes

- 933a02e: Fix critical bugs: move runtime deps to dependencies, fix vitest.setup.ts, fix FsLike import, fix deriveVerdict level 2 HUMAN, fix dead code in plan.ts, fix config parity, add human-review OracleKind, fix apiUrl validation, add retry feedback in orchestrate
