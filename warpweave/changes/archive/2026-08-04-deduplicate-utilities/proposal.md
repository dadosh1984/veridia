## Why

`splitCommand()` exists in both `src/verify/run.ts` and `src/execute/delegate.ts` — identical code. `collectFiles()` exists in both `src/analyze/analyze.ts` and `src/review/review.ts` — same logic, different output format. `src/util/agent-instruction.ts` is dead code since `--agent` flag was removed.

## What Changes

- Extract `splitCommand` to `src/util/split-command.ts`
- Extract `collectFiles` to `src/util/collect-files.ts`
- Delete `src/util/agent-instruction.ts`
- Update all imports

## Capabilities

### New Capabilities
- (none — pure refactor)

### Modified Capabilities
- (none — no behavior change)

## Impact

- `src/util/split-command.ts` — new file
- `src/util/collect-files.ts` — new file
- `src/verify/run.ts` — import from util
- `src/execute/delegate.ts` — import from util
- `src/analyze/analyze.ts` — import from util
- `src/review/review.ts` — import from util
- `src/util/agent-instruction.ts` — deleted

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — duplication causes bugs |
| Existing code reuse? | **Yes** — the code already exists, just needs extraction |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
