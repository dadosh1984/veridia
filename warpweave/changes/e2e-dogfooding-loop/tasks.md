## Tasks

### 1. RED — failing tests for the develop command

- [x] Test: `veridia develop --change <name>` on a real change → exits 0, stdout is parseable JSON with verdict field
- [x] Test: `veridia develop` without `--change` → exits non-zero, stderr error
- [x] Test: develop cycle is recorded to `.veridia/history.jsonl`

**Verify:** `pnpm exec vitest run test/develop.test.ts` — new tests fail before fix

### 2. GREEN — develop command handler

- [x] Create `src/cli/commands/develop.ts` with `handle(changeName)` that reads proposal.md, calls `triage()`, records via `measureRecord()`, prints JSON summary
- [x] Register `develop` command in `src/cli/index.ts` with `--change <name>` option
- [x] Wire `--change` to read `warpweave/changes/<name>/proposal.md` and extract first meaningful line as task

**Verify:** `pnpm exec vitest run test/develop.test.ts` — all pass

### 3. CI dogfooding replacement

- [x] Replace ad-hoc dogfooding steps in `.github/workflows/ci.yml` with `veridia develop --change <name>` (or `--self` equivalent)
- [x] Keep the existing `test`, `lint`, `tsc`, `build` steps unchanged

**Verify:** CI workflow parses as valid YAML

### 4. Regression

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`
- [x] Manual: `node dist/cli/index.js develop --change e2e-dogfooding-loop` exits 0 and prints JSON

**Verify:** full test suite green
