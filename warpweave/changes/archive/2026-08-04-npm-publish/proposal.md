## Why

veridia is technically complete but only usable from the cloned repo. Publishing to npm makes it installable globally via `npm install -g veridia` or `pnpm add -g veridia`. This is the final step to make veridia a real product.

## What Changes

- **Add `repository`, `homepage`, `bugs`, `keywords` to package.json** — metadata for npm listing
- **Add `files` field to package.json** — only publish `dist/`, `README.md`, `LICENSE`, `skills/`
- **Add `prepublishOnly` script** — runs build before publish
- **Create `.npmignore`** — exclude source, tests, warpweave artifacts
- **Publish to npm** — `npm publish`

## Capabilities

No spec-level behavior changes — packaging only.

## Impact

| Area | Impact |
|------|--------|
| `package.json` | Add repository, homepage, bugs, keywords, files, prepublishOnly |
| `.npmignore` | New file |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without publishing, only the author can use veridia |
| Existing code reuse? | **Yes** — standard npm package.json fields |
| Stdlib? | **Yes** — npm publish is the standard tool |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
