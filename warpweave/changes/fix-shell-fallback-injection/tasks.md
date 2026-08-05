## Tasks

### 1. RED — tests for the new resolution behavior

- [x] Test (win32 semantics, simulated): `spawnSync` of a `.cmd` shim in `node_modules/.bin` resolves and executes with `shell: false`
- [x] Test: arg containing spaces + quotes + `&` is passed as a single argument (exit code reflects the command, not a parse error)
- [x] Test: genuinely missing command still throws `ENOENT` (fallback preserves error semantics)
- [x] Test: no `shell: true` invocation happens — assert the spawn options passed never carry `shell: true`

**Verify:** `pnpm exec vitest run test/exec-shim.test.ts` — new tests fail before fix

### 2. GREEN — native PATHEXT resolution in exec-shim

- [x] `src/util/exec-shim.ts`: replace the `shell: true` fallback block (`:15-27`) with PATHEXT/PATH-based resolution + `spawnSync(resolved, args, { ...options, shell: false })`
- [x] Default `PATHEXT` to `';.COM;.EXE;.BAT;.CMD'` when unset
- [x] Probe `cmd + ext` in: `PATH` dirs + `node_modules/.bin` + (when cmd has a separator) the cmd's own dir
- [x] Throw original `ENOENT` when resolution fails

**Verify:** `pnpm exec vitest run test/exec-shim.test.ts` — all pass

### 3. Self-flag resolution

- [x] Run `node dist/cli/index.js report --target .` (after build)
- [x] Confirm no `shell: true — potential command injection` ERROR finding points at `src/util/exec-shim.ts`
- [x] Grep `shell\s*:\s*true` across `src/` → zero matches

**Verify:** report JSON contains 0 findings for `exec-shim.ts`; grep returns nothing

### 4. Regression + cross-platform

- [x] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test` (runs on this Windows box; CI covers mac/linux)
- [x] `node dist/cli/index.js execute`-style path still works via shim on a real `.cmd`-only command

**Verify:** full test suite green
