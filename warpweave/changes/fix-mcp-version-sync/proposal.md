## Why

The MCP server hardcodes a stale version: `new Server({ name: 'veridia', version: '0.1.8' }, ...)` at `src/mcp/index.ts:15` while `package.json` is at `0.10.0` (8 releases behind). Every MCP client that displays the tool's version reports a version that does not exist. The CLI already reads the version dynamically from `package.json` (`src/cli/version.ts`); the MCP module simply forgot to reuse it.

## What Changes

- `src/mcp/index.ts` imports `VERSION` from `src/cli/version.ts` instead of the hardcoded string literal
- The MCP server name/version always matches the installed package version on every future release

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — implementation detail alignment, no spec-level behavior change)

## Impact

- `src/mcp/index.ts` — replace string literal with imported `VERSION`
- No dependency change, no test change required (single assertion-style improvement)

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — clients see a nonexistent version, trivial to fix |
| Existing code reuse? | **Yes** — `VERSION` already exported from `src/cli/version.ts` |
| Stdlib? | **Yes** — ESM import |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
