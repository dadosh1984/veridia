## Tasks

### 1. RED — parity + response tests

- [ ] Test: MCP tool list contains `veridia_route`, `veridia_ask`, `veridia_measure`, `veridia_report`, `veridia_review`, and `veridia_session_*`
- [ ] Test: parity — every library-backed CLI command (derived from the CLI registry, minus interactive allowlist) has a `veridia_*` tool
- [ ] Test: every tool response content is a single parseable JSON value (no ANSI, no child output)
- [ ] Test: `veridia_verify` response stays clean JSON even when gates produce output

**Verify:** `pnpm exec vitest run test/mcp.test.ts` (create if missing) — new tests fail before fix

### 2. GREEN — add the new tools to the MCP server

- [ ] `src/mcp/index.ts`: add `veridia_route` (buildPlan), `veridia_ask`, `veridia_measure` (record/history), `veridia_report`, `veridia_review` to `ListToolsRequestSchema` and `CallToolRequestSchema`
- [ ] Add `veridia_session_classify`, `_assess`, `_route`, `_ask`, `_do`, `_status`, `_archive` tools wired to session functions
- [ ] Each tool validates required args and returns `JSON.stringify` result in a text content block

**Verify:** `pnpm exec vitest run test/mcp.test.ts` — all pass

### 3. Machine-output discipline in MCP responses

- [ ] Confirm (or adjust) that no new tool writes to stdout; any diagnostics route to stderr
- [ ] Wire the `machine-output` contract from `fix-exec-shim-stdout` where verify/report gates run

**Verify:** canary stdout-purity test for MCP passes (from change 2)

### 4. Regression

- [ ] `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`
- [ ] Manual: start `veridia-mcp`, list tools via a raw JSON-RPC init/list request, confirm the new tool names appear

**Verify:** full test suite green + manual tool-list check
