## 1. CI tag + release on version bump

- [x] 1.1 Add `permissions: contents: write` to the `publish` job in `.github/workflows/ci.yml`
  - **Ladder rung**: 3 (stdlib — Actions)
  - **Verify**: YAML parses

- [x] 1.2 Create git tag + GitHub Release in the version-change branch
  - **Ladder rung**: 1 (YAGNI — two-command addition)
  - **Verify**: YAML parses

