## Why

veridia has no formal schema system. Change artifacts (proposal, specs, design, tasks) have no validation. There's no way to verify that a spec file is well-formed before using it. Warpweave-dev uses `schema.yaml` + Zod for this.

## What Changes

- Create `schemas/spec-driven/schema.yaml` defining artifact structure
- Add Zod schemas for spec validation (zod is a type-only dependency, zero runtime cost after build)
- Add `veridia validate` command that checks spec files against schema
- No breaking changes

## Capabilities

### New Capabilities
- `schema-system`: Formal schema definitions and validation for change artifacts

### Modified Capabilities
- (none)

## Impact

- `schemas/spec-driven/schema.yaml` — new file
- `src/core/schemas/` — new directory with Zod schemas
- `src/cli/index.ts` — new `validate` subcommand
- `package.json` — add `zod` as dependency

## Ladder Decision

| Considered | Verdict |
|-----------|---------|
| YAGNI - skip entirely? | **No** — without validation, malformed specs go unnoticed |
| Existing code reuse? | **Yes** — pattern from warpweave-dev schemas |
| Stdlib? | **No** — need runtime type validation |
| Native platform? | **No** |
| New dependency? | **Yes** — `zod` (type-only, zero runtime cost after build) |

## Complexity

Complexity: **normal**
