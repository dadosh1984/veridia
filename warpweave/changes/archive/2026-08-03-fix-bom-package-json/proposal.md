## Why

`started in stage-5` — a UTF-8 BOM at the start of a `package.json` (standard on Windows, e.g. PowerShell `Set-Content -Encoding utf8`) breaks `JSON.parse` in oracle detection, so a target with a BOM'd `package.json` gets zero oracles and a wrong verdict. Deterministic local tooling must tolerate real-world Windows files.

## What Changes

- Strip a leading UTF-8 BOM (U+FEFF) before `JSON.parse` when reading `package.json` for oracle discovery/resolution.
- Applied in both places `package.json` scripts are read:
  - `src/assess/probe.ts` (`hasScript` game) — Stage 2 `assess` detects test-runner/type-check/lint scripts.
  - `src/verify/resolve.ts` (`readScript` in) — Stage 5 `verify` resolves detected kinds to runnable commands.
- Add a shared tiny `stripBom` helper reused by both call sites (single definition, stdlib).
- Tests: a `package.json` prefixed with a BOM yields the expected oracle/command, matching a BOM-free file.
- **BREAKING**: none.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities
- `assess`: oracle detection must recognize a `package.json` regardless of a leading UTF-8 BOM.
- `verify`: oracle command resolution must recognize a `package.json` regardless of a leading UTF-8 BOM.

## Impact

- Touches `src/assess/probe.ts`, `src/verify/resolve.ts`, new helper (e.g. `src/util/stripBom.ts`).
- Tests: `test/assess.test.ts`, `test/verify.test.ts`.
- No new runtime dependencies (stdlib).

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | No — a real correctness bug on a first-class Windows target. |
| Existing code reuse? | New shared `stripBom` helper (one expression), used by both call sites. |
| Stdlib? | Yes — `String.prototype.charCodeAt`, or `\uFEFF` codepoint compare; no package. |
| Native platform? | N/A — Node's `fs` returns raw bytes; BOM handling is manual. |
| New dependency? | No. |

## Complexity

Complexity: **minimal** (2 source files, ~15 lines, pure fix).