## Why

`.veridia/config.json` has a `models` section (plural) with `cheapest`, `mid`, `any` model configurations, but the TypeScript `VeridiaConfig` interface only has a single `model` field (singular). User configurations with `models` are silently ignored. Additionally, `warpweave/config.yaml` references `tessl_registry` (a warpweave concept, not veridia), and `.env.example` contains env vars for warpweave/RTK/superpowers that don't apply to veridia.

## What Changes

- **Sync config.json to VeridiaConfig**: Change `.veridia/config.json` from `models` (plural map) to `model` (single object) matching the TypeScript interface
- **Clean up warpweave/config.yaml**: Remove `tessl_registry` reference, keep only spec-driven schema
- **Clean up .env.example**: Remove warpweave/RTK/superpowers env vars, keep only `VERIDIA_API_KEY`

## Capabilities

### Modified Capabilities
- `config`: Sync `.veridia/config.json` format with `VeridiaConfig` TypeScript interface

## Impact

| Area | Impact |
|------|--------|
| `.veridia/config.json` | Change `models` to `model`, flatten structure |
| `warpweave/config.yaml` | Remove tessl_registry |
| `.env.example` | Remove non-veridia env vars |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — config silently ignored is a bug |
| Existing code reuse? | **Yes** — just reformatting existing config |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
