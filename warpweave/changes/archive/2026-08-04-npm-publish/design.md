## Context

See `proposal.md`. Three changes ready for implementation.

## Decisions

### npm-publish
Standard npm packaging. Add metadata fields, create .npmignore, publish.

### dogfooding-ci
Add `veridia run --self --auto` step to CI workflow after tests pass.

### configurable-weights
Add `weights` to `VeridiaConfig`. Modify `baseWeight()` to check config. Update config.json.

## Tasks

- [ ] 1.1 Add repository, homepage, bugs, keywords, files to package.json
- [ ] 1.2 Create .npmignore
- [ ] 1.3 Run npm publish

- [ ] 2.1 Add dogfooding step to .github/workflows/ci.yml

- [ ] 3.1 Add `weights` to `VeridiaConfig` in `src/config/config.ts`
- [ ] 3.2 Modify `baseWeight()` in `src/verify/weight.ts` to accept optional config overrides
- [ ] 3.3 Update `.veridia/config.json` with example weights
- [ ] 3.4 Update `warpweave/specs/verify/spec.md` with configurable weights requirement
