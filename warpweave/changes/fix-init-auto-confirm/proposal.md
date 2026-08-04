## Why

`veridia init` resolved instantly when run from a PTY (e.g. inside the opencode shell): the checkbox picker confirmed the pre-selected agent without waiting for input. The root cause is that `checkboxSelect` resolves on any `'return'`/`'enter'` keypress, and the buffered newline/Enter from launching the command arrives immediately and is misread as a confirmation. We need the picker to ignore stale leading input.

## What Changes

- Add a **ready delay** to `checkboxSelect`: keypresses received within `readyDelayMs` (default `200`ms) of the picker starting are ignored as stale-launch input, giving the render time to settle and letting a real user's Enter confirm normally.
- Existing units keep working (tests pass `readyDelayMs: 0`), and a new test proves an Enter within the window is ignored.

## Capabilities

### New Capabilities (tooling — `skip_specs: true`)
- **Stale-input guard for the interactive select** (fixes `veridia init` auto-confirm).

## Impact

| Area | Impact |
|------|--------|
| `src/prompts/checkbox-select.ts` | Add `readyDelayMs` option; ignore keys before ready |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — reported bug, init unusable from PTY |
| Existing code reuse? | **Yes** — small change to the existing picker |
| Stdlib? | **Yes** — `Date.now()` window, no dep |
| New dependency? | **No** |

## Notes / Open Items

- Deterministic tests via injected `readyDelayMs` + vitest fake timers.
