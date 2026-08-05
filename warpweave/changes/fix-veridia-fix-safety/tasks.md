## Tasks

### 1. RED — failing tests for the current defects

- [x] Test: multiline template literal containing `console.log(result)` text is NOT modified by `fix`
- [x] Test: multiline `console.log(a, b)` call spanning 3 lines is fully removed
- [x] Test: `TODO` mentioned inside a string (`const s = 'TODO'`) is NOT removed
- [x] Test: dry-run reports details and does not write to disk

**Verify:** `pnpm exec vitest run test/analyze.test.ts`

### 2. RED — failing tests for git-dirty guard

- [x] Test: uncommitted git tree → `fix` exits non-zero, no file written, stderr message
- [x] Test: `--force` writes despite dirty tree
- [x] Test: dry-run not blocked on dirty tree
- [x] Test: non-git directory not blocked

**Verify:** `pnpm exec vitest run test/fix.test.ts` (create if missing)

### 3. GREEN — AST-based removal in `src/analyze/fix.ts`

- [x] Add `dryRun?: boolean` to `autoFix(target, opts)`
- [x] Replace `fixConsoleLog`/`fixTodo` with TS-compiler-API span collection: console-call `ExpressionStatement` nodes + `//` comment ranges matching TODO patterns
- [x] Slice removed spans from source text; reparse result to guarantee valid syntax, else keep original (fail safe)
- [x] Gate `writeFileSync` behind `!dryRun && !blocked`
- [x] Git-dirty guard via `execFileWithShim('git', ['status', '--porcelain'], { cwd })`, skipped in dry-run, overridable with `--force`

**Verify:** `pnpm exec vitest run test/analyze.test.ts test/fix.test.ts` — all pass

### 4. CLI wiring in `src/cli/commands/fix.ts`

- [x] Add `--dry-run` and `--force` options to `veridia fix`
- [x] `--dry-run` output notes "would fix" vs "fixed"
- [x] Non-zero exit + stderr when guard blocks

**Verify:** `pnpm exec vitest run test/cli.test.ts` + `node dist/cli/index.js fix --dry-run --target .`

### 5. Dependency move + docs

- [x] Move `typescript` from devDependencies to dependencies in `package.json`
- [x] Update `docs/usage.md` with `--dry-run` / `--force`

**Verify:** `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test`

### 6. Regression check on own repo

- [x] `node dist/cli/index.js fix --dry-run --target .` reports 0 accidental template-literal removals

**Verify:** exit 0, no `.ts` file content changed
