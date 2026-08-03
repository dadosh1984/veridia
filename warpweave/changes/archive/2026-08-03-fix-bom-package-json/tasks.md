## 1. Shared helper

- [x] 1.1 Create `src/util/stripBom.ts` exporting `stripBom(text: string): string` — returns `text` unchanged when no leading U+FEFF, otherwise `text.slice(1)`
  - **Spec scenario**: assess/verify BOM scenarios (all)
  - **Ladder rung**: 6 (one-liner)
  - **Test first**: `test/strip-bom.test.ts` — with BOM strips it, without BOM returns unchanged, idempotent on double call
  - **Verify**: `rtk pnpm exec vitest run test/strip-bom.test.ts`

## 2. Assess detection

- [x] 2.1 Apply `stripBom` in `src/assess/probe.ts` before `JSON.parse` inside `hasScript`
  - **Spec scenario**: assess BOM scenarios (oracle detection ignores BOM, determinism)
  - **Ladder rung**: 2 (reuse helper)
  - **Test first**: `test/assess.test.ts` — a `package.json` with a leading `\uFEFF` and a `test` script yields a `test-runner` oracle
  - **Verify**: `rtk pnpm exec vitest run test/assess.test.ts`

## 3. Verify resolution

- [x] 3.1 Apply `stripBom` in `src/verify/resolve.ts` before `JSON.parse` inside `readScript`
  - **Spec scenario**: verify BOM scenarios (command resolution ignores BOM, determinism)
  - **Ladder rung**: 2 (reuse helper)
  - **Test first**: `test/verify.test.ts` — `resolveCommands(['test-runner'], target)` on a `package.json` with a leading `\uFEFF` yields the script command
  - **Verify**: `rtk pnpm exec vitest run test/verify.test.ts`

## 4. Verification

- [x] 4.1 Full pipeline: `rtk pnpm lint` → `rtk pnpm exec tsc --noEmit` → `rtk pnpm build` → `rtk pnpm test` all green
  - **Spec scenario**: all BOM scenarios end-to-end
  - **Ladder rung**: 7 (minimum — run existing checks)
  - **Verify**: `rtk pnpm lint && rtk pnpm exec tsc --noEmit && rtk pnpm build && rtk pnpm test`