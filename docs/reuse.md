# Reuse from warpweave — what we copy, rewrite, skip

A hard requirement of veridia is **NOT a fork** of warpweave/OpenSpec. This is
enforced by one rule: **do not copy a single `src/` source file.** Any copied
source file would make us a derivative work under OpenSpec's MIT copyright and
re-surface "reskinned fork" identity.

We keep the *method*, rebuild the *code* from scratch, and **reuse only generic
infrastructure** that carries no product know-how.

## The three shelves

```
COPY       → generic boilerplate (tooling, no know-how)
REWRITE    → method / skills in our own words (ideas, not text)
DO NOT COPY → product core (this IS the "fork" identity)
```

## COPY — generic infrastructure (safe, saves time)

| File | Note |
|---|---|
| `.gitignore` | reuse, trim warpweave-specific entries |
| `tsconfig.json` | standard TS + ESM ready |
| `eslint.config.js` | reuse as pattern |
| `vitest.config.ts`, `vitest.setup.ts` | reuse as pattern |
| `package.json` | pnpm≥9 / Node≥22.12 conventions, but re-write name→`veridia`, scripts |
| CI workflow (.github/workflows/ci.yml) | the linux/macos/**windows** matrix is a good practice to carry; re-write paths |
| `.gitattributes` | reuse |
| `LICENSE` | our own MIT (re-authored, not OpenSpec's) |
| `SECURITY.md` | reuse pattern |

These are standard tooling with zero innovation value; copying them does not make
us a fork.

## REWRITE — carry the method, re-author in our words

| Source area | veridia action |
|---|---|
| `docs/` philosophy ideas | re-author into our own docs (philosophy.md etc.) |
| `skills/` ideas (drift, token-budget, learn, guardrails) | rebuild as veridia mechanics (classify/assess/route/verify/measure) |
| `AGENTS.md` | write a fresh one for veridia |
| `build.js` | reuse the pattern (clean dist → tsc), re-author |
| `flake.nix` (optional) | only if we adopt nix |

The value is the *idea*, not the text — so we re-express, never lift.

## DO NOT COPY — the fork identity (derivative risk)

| Area | Why |
|---|---|
| `src/` (cli, commands, core, utils) | this is the OpenSpec-derived product core |
| `bin/` | tied to `src/` layout |
| `schemas/` | OpenSpec's spec-driven schema |
| `warpweave/` | the changes/specs scaffold = the fork marker |
| `.changeset/` | release machinery of that project |

Even seemingly "generic" utilities in `src/` (task-progress, spec-discovery,
file-state) carry OpenSpec design decisions. If needed, **re-implement from
scratch**; never copy.

## Also skip
- `pnpm-lock.yaml`, `node_modules/`, `dist/` → regenerate via `pnpm install`.
- `.opencode/`, `.unified/` → local session artifacts (gitignored), not part of source.
- `CHANGELOG.md` / version-sync files → start fresh for veridia.

## Bottom line
> Not-a-fork is enforced by one rule: **no `src/` line copied.**
> Everything else is either generic infra (copy) or method (re-author).
