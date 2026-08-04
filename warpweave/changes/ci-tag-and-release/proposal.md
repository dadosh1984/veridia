## Why

veridia's CI publishes to npm automatically on a version change, but a GitHub Release lags behind: GitHub Releases are tied to git tags, and the publish job never creates one. We observed the release stuck at v0.1.1 while npm was on v0.1.2. The publish job should also tag and release the version it ships, so npm and GitHub Releases stay in lockstep with no manual `git tag` + `gh release create` step.

## What Changes

- In `.github/workflows/ci.yml`, the existing `publish` job (which already guards on a version change) additionally:
  1. creates a lightweight git tag `v<local>` and pushes it, and
  2. creates a GitHub Release for that tag (auto-generated notes).
- Requires `permissions: contents: write` on the job so the Actions token can push tags and create releases.

## Capabilities

### New Capabilities (tooling — `skip_specs: true`)
- **CI tag + GitHub Release on version bump**: automatic release artifacts from the publish job.

## Impact

| Area | Impact |
|------|--------|
| `.github/workflows/ci.yml` | `publish` job: add `permissions`, tag push, `gh release create` |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — explicit request to keep GitHub release in sync |
| Existing code reuse? | **Yes** — extend the existing version-change guard in the `publish` job |
| Stdlib / platform? | **Yes** — git + `gh` (both pre-installed on Actions runners, `gh` pre-authed with `GITHUB_TOKEN`) |
| New dependency? | **No** |

## Notes / Open Items

- Tag is **lightweight** (`git tag vX`) to avoid requiring git user config on the runner.
- `gh release create --generate-notes` drafts from commits/PRs since the last tag.
- No new secrets: `GITHUB_TOKEN` (auto) is used; `NPM_TOKEN` is unchanged.
