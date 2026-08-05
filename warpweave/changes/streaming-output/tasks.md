## Tasks

### 1. RED — failing tests for streaming output

- [ ] Test: `runCommand` with `streamOutput: true` inherits stderr (child stderr appears on parent stderr)
- [ ] Test: `runCommand` without `streamOutput` captures stderr (existing behavior preserved)
- [ ] Test: `veridia verify --verbose` accepts the flag and exits normally

**Verify:** `pnpm exec vitest run test/verify.test.ts` — new tests fail before fix

### 2. GREEN — streaming in exec-shim

- [ ] Add `streamOutput?: boolean` to `execFileWithShim` options; when true, use `stdio: ['ignore', 'inherit', 'pipe']`
- [ ] Pass through in `runCommand` via `RunFn` signature
- [ ] Add `streamOutput` to `VerifyDeps` and wire through `verify()`

**Verify:** `pnpm exec vitest run test/verify.test.ts test/exec-shim.test.ts` — all pass

### 3. CLI wiring

- [ ] Add `--verbose` flag to `verify` command in `src/cli/index.ts`
- [ ] Add `--verbose` flag to `run` command in `src/cli/index.ts`
- [ ] Add `--verbose` flag to `develop` command in `src/cli/index.ts`
- [ ] Wire `--verbose` through `handle()` to `verify()` deps

**Verify:** `node dist/cli/index.js verify --help` shows `--verbose`

### 4. Regression

- [ ] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`

**Verify:** full test suite green
