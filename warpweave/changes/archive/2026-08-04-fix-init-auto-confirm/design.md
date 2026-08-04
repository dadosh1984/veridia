## Context

See `proposal.md`. `veridia init`'s `checkboxSelect` confirms the pre-selected agent instantly when launched from a PTY because a buffered Enter/`\r` is misread as confirmation.

## Decisions

### 1. `readyDelayMs` grace window (default 200ms)
Compute `readyAt = Date.now() + readyDelayMs` when the picker opens; ignore any keypress (including `'return'`) until `Date.now() >= readyAt`. This drops the stale launch keystroke while leaving a real (human-speed) Enter able to confirm the pre-selected default.

### 2. Injected and testable
The option defaults to `200`ms in production; unit tests pass `readyDelayMs: 0` to keep the existing deterministic key-sequence tests, plus a dedicated test with vitest fake timers asserting an in-window Enter is ignored.

## Tasks

- [ ] 1.1 Add `readyDelayMs` option and ready-window guard to `src/prompts/checkbox-select.ts`
  - **Ladder rung**: 1 (YAGNI — add a time window and early return)
  - **Test first**: `test('ignores a confirming enter received within the ready delay', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`

- [ ] 1.2 Keep existing tests green with `readyDelayMs: 0`
  - **Ladder rung**: 1 (YAGNI — test-option)
  - **Verify**: `rtk pnpm exec vitest run test/checkbox-select.test.ts`
