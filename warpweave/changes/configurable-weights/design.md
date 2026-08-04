## Context

See `proposal.md`. Oracle weights are hardcoded. Making them configurable.

## Decisions

### Config format
Add `weights` section to `VeridiaConfig`:
```json
{
  "weights": {
    "test-runner": 5,
    "type-check": 3,
    "lint": 2,
    "ci": 1
  }
}
```

### baseWeight override
`baseWeight(kind, config?)` — if config has a weight for this kind, use it; otherwise use default.

## Tasks

- [ ] 3.1 Add `weights` to `VeridiaConfig` in `src/config/config.ts`
- [ ] 3.2 Modify `baseWeight()` in `src/verify/weight.ts` to accept optional config overrides
- [ ] 3.3 Update `.veridia/config.json` with example weights
- [ ] 3.4 Update `warpweave/specs/verify/spec.md` with configurable weights requirement
