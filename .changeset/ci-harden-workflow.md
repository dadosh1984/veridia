---
"veridia": patch
---

ci: harden GitHub Actions workflow

- Expand Node matrix from `22.13` to `22.13` + `24.x` (current LTS).
- Split the single `test` job into `install`, `lint`, `typecheck`, `test` for parallel execution.
- Add `actions/cache@v4` for the pnpm store (Linux, macOS, Windows paths).
- Bump `actions/checkout` from `v4` to `v6` (consistent with `opencode.yml`).
- Add non-blocking `pnpm audit --prod` step (`continue-on-error: true`).
- Add zero-dependency bundle-size guard at `scripts/check-size.mjs` (CLI 25.7 KB / MCP 103.2 KB gzip, limit 250 KB).
- Tighten `vitest` coverage thresholds from `50/40/60/55` to `65/58/62/65` (actual coverage 68.06 / 60.42 / 64.98 / 69.9).
- Add `pnpm size` script.
