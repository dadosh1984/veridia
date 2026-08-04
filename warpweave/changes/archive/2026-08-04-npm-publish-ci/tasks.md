## 1. Auto-publish on push

- [x] 1.1 Add version-aware `publish` job to `.github/workflows/ci.yml`
  - **Ladder rung**: 3 (stdlib — GitHub Actions)
  - **Verify**: YAML parses (no local running available; gate is CI-run)

- [x] 1.2 Document `NPM_TOKEN` secret requirement
  - **Ladder rung**: 1 (YAGNI — config note)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
