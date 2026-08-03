## Why

`src/cli/index.ts` is 402 lines of if-else. Each new command adds ~30 lines to the same file. No separation between dispatch and logic. Hard to test, hard to extend.

## What Changes

- Create `src/cli/commands/` directory with one file per command
- Each file exports a handler function: `export function handle(args: string[]): void`
- CLI becomes a dispatcher: `command → handler` via a `Map<string, Handler>`
- No new dependencies — pure refactor

## Capabilities

### New Capabilities
- (none — pure refactor)

### Modified Capabilities
- (none — no behavior change)

## Impact

- `src/cli/index.ts` — reduced to dispatcher (~50 lines)
- `src/cli/commands/classify.ts`, `assess.ts`, `route.ts`, `ask.ts`, `plan.ts`, `execute.ts`, `verify.ts`, `measure.ts`, `review.ts`, `agents.ts`, `init.ts`, `generate.ts` — new files
- All existing tests must pass unchanged

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — 402-line if-else is already painful |
| Existing code reuse? | **Yes** — pattern from warpweave-dev (register functions) |
| Stdlib? | **Yes** — `Map<string, Function>` |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **normal**
