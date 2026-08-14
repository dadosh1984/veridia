---
"veridia": minor
---

build: migrate from `tsup` to `tsdown` (Rolldown-based)

- Replace `tsup` (esbuild) with `tsdown` (Rolldown). Build is roughly 2–3× faster in dev and noticeably faster on CI cold builds.
- ESM output is now `*.mjs` instead of `*.js` (correct Node ESM convention).
- `bin` entries updated to `dist/cli/index.mjs` and `dist/mcp/index.mjs`.
- Test helpers (`test/helpers/run-cli.ts`, `test/mcp.test.ts`) and `vitest.setup.ts` updated for the new extension.
- Bundle sizes stay within budget:
  - CLI: 92.6 KB → 103.3 KB raw / 21.7 KB → 25.7 KB gzip
  - MCP: 559.8 KB → 499.2 KB raw / 105.5 KB → 103.2 KB gzip
