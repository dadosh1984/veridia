## 1. Repo scaffolding

- [x] 1.1 Initialize package.json (name `veridia`, `type: module`, engines Node ≥ 22.12, scripts: lint/build/test/typecheck) and dev dependencies (typescript, vitest, eslint, @types/node)
  - **Spec scenario**: N/A — tooling prerequisite for all cli scenarios
  - **Ladder rung**: 2 (reuse — pnpm ≥ 9 / Node ≥ 22.12 conventions from reuse.md, re-authored)
  - **Test first**: `test/helpers/run-cli.ts` boots `dist/cli/index.js`; this task only asserts tooling runs (`pnpm --version`)
  - **Verify**: `rtk pnpm install && rtk pnpm exec tsc --noEmit`
- [x] 1.2 Create tsconfig.json (strict, ESM, NodeNext, outDir dist), eslint.config.js, vitest.config.ts, vitest.setup.ts
  - **Spec scenario**: N/A — build/test infra
  - **Ladder rung**: 2 (reuse — generic config patterns from reuse.md COPY shelf, re-written)
  - **Test first**: `test/helpers/run-cli.ts` compiles under strict TS
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit`
- [x] 1.3 Create build.js (clean dist/ → tsc) and .gitignore, .gitattributes, LICENSE (own MIT), SECURITY.md; re-author AGENTS.md for veridia (fresh, not copied)
  - **Spec scenario**: N/A — repo hygiene
  - **Ladder rung**: 2 (reuse — re-author build.js pattern; trim warpweave-specific gitignore entries)
  - **Test first**: N/A — verified by build + git ignore behavior
  - **Verify**: `rtk pnpm build`
- [x] 1.4 Create .github/workflows/ci.yml with linux/macos/windows matrix running lint → tsc --noEmit → build → test
  - **Spec scenario**: N/A — CI scaffold (Stage 0 DoD)
  - **Ladder rung**: 2 (reuse — matrix pattern from reuse.md, paths re-written)
  - **Test first**: N/A — CI-only; locally mirrored by running the four commands in order
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk vitest run`

## 2. CLI implementation

- [x] 2.1 Create `src/cli/index.ts` shebang entry that parses `process.argv` and dispatches: `--help`/`-h`/no-args → usage to stdout exit 0; `version`/`-v` → version exit 0; anything else → stderr error exit 1
  - **Spec scenario**: Help output (all 3 scenarios), Version output (both), Unknown argument handling (both), Exit status contract (both)
  - **Ladder rung**: 6 (one-liner — a few `process.argv` if/else checks, no framework)
  - **Test first**: `test/cli.test.ts` boots the compiled CLI in-process via `test/helpers/run-cli.ts` with `--help`, `version`, `--bogus`, no-args; asserts stdout/stderr/exit codes per spec
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 2.2 Create `src/cli/version.ts` exporting the version constant and wire `package.json` `bin` → `dist/cli/index.js`
  - **Spec scenario**: Version output; Exit status contract
  - **Ladder rung**: 3 (stdlib — shared constant module; no fs/import machinery)
  - **Test first**: `test/cli.test.ts` asserts `veridia version` prints `package.json` version and exit 0
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`
- [x] 2.3 Add `test/config-parity.test.ts` asserting `src/cli/version.ts` equals `package.json` version (drift guard)
  - **Spec scenario**: Version output (guards the source of truth)
  - **Ladder rung**: 6 (one-liner — single equality assertion)
  - **Test first**: `test('version constant matches package.json', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/config-parity.test.ts`

## 3. Verification

- [x] 3.1 Run full suite: `pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm build` → `pnpm test` all green on this Windows machine
  - **Spec scenario**: Exit status contract + Help/Version output end-to-end
  - **Ladder rung**: 7 (minimum — run existing checks, no new code)
  - **Test first**: N/A — full-suite run
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk vitest run`
- [x] 3.2 Manual smoke: `node dist/cli/index.js --help`, `node dist/cli/index.js version` exit 0; `node dist/cli/index.js bogus` exit 1 (Stage 0 DoD: clean env, --help works, tests green)
  - **Spec scenario**: Help output; Version output; Unknown argument handling
  - **Ladder rung**: 7 (minimum — no code, manual check)
  - **Test first**: N/A
  - **Verify**: `rtk node dist/cli/index.js --help && rtk node dist/cli/index.js version`
