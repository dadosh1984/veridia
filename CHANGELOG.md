# veridia

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
