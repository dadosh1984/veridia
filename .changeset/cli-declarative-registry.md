---
"veridia": patch
---

refactor(cli): declarative command registry

- Extract cac command registration into `src/cli/registry.ts` with a typed `CommandDef` data shape and `registerAll` helper.
- Rewrite `src/cli/index.ts` as a flat list of `CommandDef` literals (29 commands) plus three inline special cases (`version`, `completion`, default `[task]`).
- The `cli.parse()` call is preserved in a `try/catch` (carries over the existing clean-error behaviour from `e7c0137`).
- Adding a new CLI command is now: append one literal to the `commands` array.
- No public-API or behaviour change: all 32 commands register identically (verified by `veridia --help`, `veridia version`, and 340/340 tests).
- Internal `AnyFunction` type in `registry.ts` documents that cac signatures are erased at the boundary — handlers are still fully type-checked at the call site.
