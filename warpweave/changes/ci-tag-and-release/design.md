## Context

See `proposal.md`. The CI `publish` job already detects a version change; we extend it to also tag and release, keeping npm and GitHub Releases in sync automatically.

## Decisions

### 1. Add `permissions: contents: write` to the `publish` job
The checkout's auto-configured `GITHUB_TOKEN` must have write access to push the tag and create the release. This is job-scoped, not repo-wide.

### 2. Lightweight tag (no git user config)
`git tag v$LOCAL` is lightweight, so it does not need `user.name`/`user.email` on the runner. `checkout@v4` already configures `http.extraheader` with the token, so `git push origin v$LOCAL` authenticates.

### 3. Release via pre-authenticated `gh`
`gh release create v$LOCAL --title "v$LOCAL" --generate-notes` uses the Actions `$GITHUB_TOKEN` (auto-authenticated in Actions) and auto-drafts notes from commits/PRs since the last tag.

### 4. Only inside the version-change branch
Tagging/releasing happens inside the existing `if [ "$LOCAL" != "$PUBLISHED" ]` branch, so repeat pushes of an unchanged version neither re-publish nor re-tag.

## Tasks

- [ ] 1.1 Add `permissions: contents: write` to the `publish` job in `.github/workflows/ci.yml`
  - **Ladder rung**: 3 (stdlib — Actions)
  - **Verify**: YAML parses

- [ ] 1.2 Create git tag + GitHub Release in the version-change branch
  - **Ladder rung**: 1 (YAGNI — two-command addition)
  - **Verify**: YAML parses
