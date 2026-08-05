## Tasks

### 1. RED — canary tests for stdout purity (oracle)

- [x] Test: `runCli('--target', '.')` in JSON mode → stdout is single parseable JSON, zero ANSI codes (regex `\u001b` absent)
- [x] Test: `veridia analyze --target <repo-with-test-gates>` → stdout parseable JSON, child banner absent from stdout, present in stderr
- [x] Test: MCP `veridia_verify` over stdio transport → JSON-RPC frames well-formed (no child bytes in the transport stream)

**Verify:** `pnpm exec vitest run test/e2e.test.ts test/cli.test.ts` — new tests fail before fix

### 2. GREEN — capture stdout in exec-shim

- [x] `src/util/exec-shim.ts`: `stdio` → `['ignore', 'pipe', 'pipe']` in both normal and Windows shell-fallback branches
- [x] Verify `result.stdout` is now captured; add a unit test in `test/exec-shim.test.ts` asserting a child's stdout is not inherited

**Verify:** `pnpm exec vitest run test/exec-shim.test.ts`

### 3. GREEN — route captured output in callers

- [x] `src/verify/run.ts`: `runCommand` returns captured stdout alongside exitCode/error
- [x] `src/execute/delegate.ts`: `runGates` surfaces captured gate stdout to stderr in machine mode
- [x] `src/cli/shared.ts`: add `isMachineMode(opts)` (--json / --auto / MCP)
- [x] Wire machine-mode routing into verify/execute/analyze gate invocations

**Verify:** `pnpm exec vitest run test/verify.test.ts test/execute.test.ts test/analyze.test.ts`

### 4. GREEN — MCP entrypoint pins machine mode

- [x] `src/mcp/index.ts`: set machine mode unconditionally; ensure `veridia_verify` gate output routes to stderr, never the stdio channel
- [x] MCP e2e test: frames well-formed after fix

**Verify:** `pnpm exec vitest run test/mcp.test.ts` (create if missing) + canary tests from task 1 now pass

### 5. Regression + self-check

- [x] `node dist/cli/index.js analyze --target .` → stdout single JSON, no ANSI
- [x] Grep-audit: no remaining `stdio: ['inherit'` or direct `process.stdout.write` of child output

**Verify:** `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`
