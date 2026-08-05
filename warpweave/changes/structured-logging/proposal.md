## Why

veridia currently writes diagnostics via ad-hoc `process.stderr.write()` calls scattered across 20+ files. There is no consistent format, no log levels, no structured output for machine consumers, and no way to control verbosity. For a tool that measures its own quality, having unstructured logging is a blind spot: you can't grep, filter, or analyze veridia's own operational signals.

## What Changes

- Add a `src/util/log.ts` module with a lightweight structured logger: `log.info()`, `log.warn()`, `log.error()`, `log.debug()`
- In machine mode (`--json`, `--auto`, MCP), log output is JSON lines to stderr
- In TTY mode, log output is human-readable with `veridia:` prefix (preserving current format)
- Replace all ad-hoc `process.stderr.write()` calls across the codebase with the logger
- No new dependencies — stdlib only

## Capabilities

### New Capabilities
- `structured-logging`: Consistent structured logging with levels (info/warn/error/debug), machine-readable JSON output, and TTY-friendly formatting

### Modified Capabilities
- (none — no spec-level behavior changes; logging is additive infrastructure)

## Impact

- `src/util/log.ts` (new) — structured logger
- 20+ files — replace `process.stderr.write()` with `log.*()` calls
- No dependency change

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — 20+ ad-hoc stderr writes with no structure is tech debt |
| Existing code reuse? | **No** — no existing logger |
| Stdlib? | **Yes** — `process.stderr.write`, `JSON.stringify`, `Date` |
| Native platform? | **No** |
| New dependency? | **No** — explicitly rejects pino/winston: a 30-line stdlib logger suffices |

## Complexity

Complexity: **normal**
