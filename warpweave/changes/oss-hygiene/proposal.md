## Why

The package currently has 0 stars/forks and no signals that help a potential contributor or adopter trust/understand it at a glance: README has no CI/npm badges, the publish workflow does not use `npm publish --provenance`, and there is no dependency-update bot. For an open-source tool whose entire premise is "verification", provenance on published artifacts is symbolically important.

## What Changes

- Add CI and npm badges to `README.md` (from the existing GitHub Actions workflow and npm package)
- Add `npm publish --provenance` to the release workflow in `.github/workflows/ci.yml`
- Add a dependency-update bot config: Renovate (`renovate.json`) — the lighter standard option for pnpm workspaces — or Dependabot if preferred
- No code/behavior change

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none)

## Impact

- `README.md` — badges
- `.github/workflows/ci.yml` — `--provenance` flag on `npm publish`
- `renovate.json` (new) — dependency updates; note `pnpm-lock.yaml` is managed by pnpm, so Renovate must use pnpm (enabled by default)
- No runtime dependency change

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **Deferred** — visibility is lowest priority; only do after P0/P1 fixes. But cheap and zero-risk |
| Existing code reuse? | **Yes** — badges point at existing workflows; publish step already exists in ci.yml |
| Stdlib? | **N/A** — repo/docs work, not runtime code |
| Native platform? | **N/A** |
| New dependency? | **No runtime dependency** — Renovate is a CI bot, not a package dep |

## Complexity

Complexity: **minimal**
