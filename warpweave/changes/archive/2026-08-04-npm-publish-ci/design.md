## Context

See `proposal.md`. veridia is published to npm but manually; we automate it via a CI job that runs after tests and only on `main` pushes with a version change.

## Decisions

### 1. Extend the existing `ci.yml` with a `publish` job (not a separate workflow)
The repo already has `.github/workflows/ci.yml` with a `test` job running `lint → tsc → build → test` on push to main and PRs. Adding a `publish` job that `needs: [test]` keeps one workflow, reuses the exact setup steps (pnpm, node 22.12), and guarantees the package is only published after a green CI on the same run.

### 2. Gate: `main`-branch `push` only
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```
PR builds stop at `test`; only real `main` merges proceed to publish.

### 3. Version-aware guard to avoid E403 re-publish
`npm publish` fails if the version already exists. Compare the local version against `npm view veridia version`; publish only when they differ. This makes re-runs / repeat pushes of an unchanged version a no-op instead of a failing job, and lets the very next version bump publish automatically.

### 4. Auth via `NPM_TOKEN` secret
`actions/setup-node` with `registry-url: https://registry.npmjs.org` lets `npm publish` authenticate from `NODE_AUTH_TOKEN=${{ secrets.NPM_TOKEN }}`. Never write the token to the repo. The token must be an automation/granular token with **bypass 2FA** and write access to `veridia` (the account enforces 2FA on publish).

## Tasks

- [ ] 1.1 Add version-aware `publish` job to `.github/workflows/ci.yml`
  - **Ladder rung**: 3 (stdlib — GitHub Actions)
  - **Verify**: YAML parses (no local running available; gate is CI-run)

- [ ] 1.2 Document `NPM_TOKEN` secret requirement
  - **Ladder rung**: 1 (YAGNI — config note)
  - **Verify**: `rtk pnpm exec tsc --noEmit`
