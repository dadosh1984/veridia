# Contributing to veridia

veridia is a model-agnostic quality tool. Quality comes from process, not from
the model — so the contribution process itself is the product. This file
documents the workflow we dogfood.

## Prerequisites

- **Node** ≥ 22.13 (see `engines` in `package.json`)
- **pnpm** ≥ 9
- **rtk** — every shell command is wrapped in `rtk` (see `AGENTS.md`)

```bash
pnpm install
```

## The triage loop (our own doctrine)

Every change goes through veridia's own pipeline:

```
TASK → CLASSIFY → ASSESS → ROUTE → ASK? → DO → VERIFY → MEASURE
```

We do not merge a change until its `**Verify:**` command passes. See
`docs/roadmap.md` for the stage map and `docs/` for the full method.

## Development workflow

1. **Spec first.** Specs live in `warpweave/specs/`. Docs are a note-taking
   layer, not a hard gate (Variant B in `docs/roadmap.md`).
2. **Climb the Ponytail ladder** before writing each line:
   YAGNI → reuse → stdlib → native → dependency → one-liner → minimum.
   Mark deliberate simplifications `// ponytail: <reason>`.
3. **TDD (RED-GREEN-REFACTOR).** Write a failing test, watch it fail, write
   minimal code, watch it pass.
4. **Verify before done.** Run the task's `**Verify:**` command (RTK-wrapped).

## Verify order (mirrors CI)

```bash
rtk pnpm lint
rtk pnpm exec tsc --noEmit
rtk pnpm build
rtk pnpm test
```

Focused test file:

```bash
rtk pnpm exec vitest run test/<file>.test.ts
```

## Changesets (versioning & release)

veridia uses [changesets](https://github.com/changesets/changesets) for
versioning and changelog generation.

### 1. Add a changeset

After making a change, add a changeset describing it:

```bash
rtk pnpm changeset
```

This creates a markdown file in `.changeset/` with a semver bump
(`major` / `minor` / `patch`). Write a clear, user-facing summary — it becomes
the CHANGELOG entry.

### 2. Version bump

When ready to release, bump the version and update `CHANGELOG.md`:

```bash
rtk pnpm changeset version
```

This consumes all pending changesets, bumps `package.json`, and rewrites
`CHANGELOG.md`. Review and commit the result.

### 3. Build & size check

```bash
rtk pnpm build
rtk pnpm size
```

`pnpm size` runs `scripts/check-size.mjs` — a zero-dependency guard that fails
if the CLI or MCP bundle exceeds 250 KB gzip.

### 4. Tag & push

Publishing is driven entirely by the tag-based CI workflow
(`.github/workflows/publish.yml`). Create an annotated tag and push it:

```bash
rtk git tag -a vX.Y.Z -m "veridia vX.Y.Z — <summary>"
rtk git push origin main --tags
```

The `Publish` workflow triggers on `push` of a `v*` tag, runs
`npm publish --provenance` with OIDC, and creates a GitHub release. Do **not**
run `changeset publish` locally — CI owns publishing.

## Windows is a first-class target

- Never hardcode path separators; use `path.join(...)`.
- Never assume LF; trim `\r\n` in test assertions.
- CI runs linux/macos/windows. Windows-only branches (e.g. PATHEXT shim
  resolution) are gated with `describe.runIf(process.platform === 'win32')`.

## Repo layout

- `src/cli/` — CLI entrypoint (`index.ts`, `version.ts`, `registry.ts`).
- `src/` — the triage pipeline (classify, assess, route, ask, execute, verify, measure).
- `test/` — vitest suite (`helpers/run-cli.ts` boots the compiled CLI).
- `docs/` — the method (source of truth for product decisions).
- `warpweave/` — spec-driven planning artifacts (changes + specs).
- `.changeset/` — pending changesets (consumed by `changeset version`).

## Questions?

Open an issue, or read `docs/` for the full method (philosophy, mechanics,
verifiability, roadmap, reuse, naming).
