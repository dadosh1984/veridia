## Why

Oracle weights are currently hardcoded in `src/verify/weight.ts` (test-runner=3, type-check=2, lint=1, ci=0). Users cannot adapt veridia to their project's specific needs. Making weights configurable via `.veridia/config.json` allows projects to prioritize their most meaningful checks.

## What Changes

- **Add `weights` section to `VeridiaConfig`** — optional map of OracleKind to number
- **Modify `baseWeight()` in `weight.ts`** — check config for overrides before using defaults
- **Update `.veridia/config.json`** — add example weights section
- **Update `warpweave/specs/verify/spec.md`** — add configurable weights requirement

## Capabilities

### Modified Capabilities
- `verify`: Oracle weights configurable via `.veridia/config.json`

## Impact

| Area | Impact |
|------|--------|
| `src/config/config.ts` | Add `weights` to `VeridiaConfig` interface |
| `src/verify/weight.ts` | `baseWeight()` checks config for overrides |
| `.veridia/config.json` | Add example weights section |
| `warpweave/specs/verify/spec.md` | Add configurable weights requirement |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — hardcoded weights are a known limitation |
| Existing code reuse? | **Yes** — `loadConfig()` already reads `.veridia/config.json` |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
