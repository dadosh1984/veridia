## Why

veridia's roadmap promises dogfooding: "veridia builds veridia." Currently, CI only runs standard lint/tsc/build/test. Adding a `veridia run --self` step to CI proves the tool works on its own code and catches regressions.

## What Changes

- **Add dogfooding step to `.github/workflows/ci.yml`** — after tests, run `veridia run "classify task" --self --auto` and `veridia run "assess project" --self --auto`
- **Add `--json` flag to `veridia run`** — for CI-friendly JSON output (optional, can parse human-readable too)

## Capabilities

### Modified Capabilities
- `dogfooding`: CI pipeline runs veridia on its own source

## Impact

| Area | Impact |
|------|--------|
| `.github/workflows/ci.yml` | Add dogfooding step after tests |
| `src/cli/commands/run.ts` | Optional `--json` flag for CI output |

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — dogfooding is the only way to prove the tool works |
| Existing code reuse? | **Yes** — `veridia run --self` already exists |
| Stdlib? | **Yes** |
| Native platform? | **No** |
| New dependency? | **No** |

## Complexity

Complexity: **minimal**
