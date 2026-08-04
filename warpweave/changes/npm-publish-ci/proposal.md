## Why

`veridia` is published to npmjs (v0.1.1), but today that publication is a manual step. Releasing requires a human to run `npm publish` on every version bump. The project should dogfood its own automation: pushing to `main` (with a passing CI) should publish the package to npmjs automatically whenever the version changes.

## What Changes

- Add a `publish` job to `.github/workflows/ci.yml` that runs **after** the `test` job, on `main`-branch pushes only (not PRs).
- The job installs deps, builds, then runs `npm publish --access public` **only if the local version differs from the version currently published on npm** (so re-pushes of an already-published version skip cleanly instead of erroring with E403).
- Auth is via a `NPM_TOKEN` GitHub Actions secret (never hardcoded).

## Capabilities

### New Capabilities (tooling — `skip_specs: true`)
- **CI/CD publish pipeline**: automatic npm publish on push to main, gated by CI and version change.

## Impact

| Area | Impact |
|------|--------|
| `.github/workflows/ci.yml` | Add `publish` job (`needs: test`, gated on `main` push) |
| GitHub repo settings | New secret `NPM_TOKEN` (automation token with bypass 2FA) |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — explicit request for auto-publish on push |
| Existing code reuse? | **Yes** — add a job to the existing `ci.yml`, reuse test job/steps |
| Stdlib? | **Yes** — GitHub Actions built-ins + npm CLI |
| New dependency? | **No** |
| Version-aware guard? | **Yes** — compare local vs published version to avoid E403 re-publish |

## Notes / Open Items

- **Secret not settable via CLI here** — the user must add `NPM_TOKEN` in the GitHub repo secrets UI (or via `gh secret set` with gh auth).
- The token must have **bypass 2FA** (the account enforces 2FA on publish) and `write` on the `veridia` package.

## Complexity

Complexity: **small**
