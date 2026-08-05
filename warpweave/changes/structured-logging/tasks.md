## Tasks

### 1. RED — failing tests for the logger

- [x] Test: `log.info('test')` in TTY mode → output contains `veridia: info: test`
- [x] Test: `log.info('test')` in non-TTY mode → output is valid JSON with `level`, `msg`, `timestamp`
- [x] Test: `log.debug('test')` without `VERIDIA_DEBUG` → no output
- [x] Test: `log.debug('test')` with `VERIDIA_DEBUG=1` → output present

**Verify:** `pnpm exec vitest run test/log.test.ts` — new tests fail before fix

### 2. GREEN — logger module

- [x] Create `src/util/log.ts` with `info`, `warn`, `error`, `debug` functions
- [x] TTY mode: `veridia: <level>: <msg>` format
- [x] Non-TTY mode: JSON line with `level`, `msg`, `timestamp`
- [x] Debug gated by `VERIDIA_DEBUG` env

**Verify:** `pnpm exec vitest run test/log.test.ts` — all pass

### 3. Migration — replace ad-hoc stderr writes

- [x] Replace `process.stderr.write()` in `src/cli/commands/` files
- [x] Replace `process.stderr.write()` in `src/verify/` files
- [x] Replace `process.stderr.write()` in `src/measure/` files
- [x] Replace `process.stderr.write()` in `src/execute/` files

**Verify:** `pnpm exec vitest run` — all pass

### 4. Regression

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`

**Verify:** full test suite green
