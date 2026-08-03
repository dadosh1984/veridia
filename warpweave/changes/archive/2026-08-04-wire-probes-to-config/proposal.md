## Why

`probeOracles()` uses hardcoded file lists (vitest.config.ts, eslint.config.js, etc.). The same lists exist in `DEFAULT_CONFIG.probes` but `probe.ts` never reads from config. If a user overrides probes in `.veridia/config.json`, assess ignores them.

## What Changes

- `probeOracles()` accepts optional config parameter
- When config is provided, probe specs come from config instead of hardcoded lists
- `assess()` loads config and passes it to `probeOracles()`
- Backward compatible — no config = old behavior

## Capabilities

### New Capabilities
- (none — bugfix)

### Modified Capabilities
- `assess`: REQUIREMENT changed — now respects user-configured probes

## Impact

- `src/assess/probe.ts` — accept optional config, build PROBES from it
- `src/assess/assess.ts` — load config, pass to probeOracles
- `src/triage/triage.ts` — already loads config, passes to assess

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — config is dead code without this |
| Existing code reuse? | **Yes** — `loadConfig()` already exists |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
