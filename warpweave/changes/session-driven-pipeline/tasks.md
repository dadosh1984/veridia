## 1. Session Core

- [x] 1.1 Create `src/session/types.ts` — Session interface
  - **Spec scenario**: Session file format
  - **Ladder rung**: 2 (reuse — follows MeasureEntry pattern)
  - **Test first**: `test('Session has all required fields', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/session.test.ts`

- [x] 1.2 Create `src/session/session.ts` — readSession, writeSession, clearSession
  - **Spec scenario**: Session created, Session read, Session written
  - **Ladder rung**: 2 (reuse — follows history.ts pattern)
  - **Test first**: `test('readSession returns null when no file', ...)`, `test('writeSession creates file', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/session.test.ts`

## 2. Session Commands

- [x] 1.3 Create `src/cli/commands/session-classify.ts`
  - **Spec scenario**: Task from argument, Task from session, Step advances
  - **Ladder rung**: 2 (reuse — wraps existing classify())
  - **Test first**: `test('session-classify writes type to session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.4 Create `src/cli/commands/session-assess.ts`
  - **Spec scenario**: Target from flag, Step advances
  - **Ladder rung**: 2 (reuse — wraps existing assess())
  - **Test first**: `test('session-assess writes level to session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.5 Create `src/cli/commands/session-route.ts`
  - **Spec scenario**: Route from session, Step advances
  - **Ladder rung**: 2 (reuse — wraps existing buildPlan())
  - **Test first**: `test('session-route writes plan to session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.6 Create `src/cli/commands/session-ask.ts`
  - **Spec scenario**: Questions displayed, Answers written, Level 3 skips, Step advances
  - **Ladder rung**: 2 (reuse — wraps existing askInteractive())
  - **Test first**: `test('session-ask writes answers to session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.7 Create `src/cli/commands/session-do.ts`
  - **Spec scenario**: Plan executed, Answers included, Step advances
  - **Ladder rung**: 2 (reuse — wraps existing verify() + measureRecord())
  - **Test first**: `test('session-do writes verdict to session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.8 Create `src/cli/commands/session-status.ts`
  - **Spec scenario**: Session displayed, No session
  - **Ladder rung**: 6 (one-liner — print session fields)
  - **Test first**: `test('session-status prints session', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

- [x] 1.9 Create `src/cli/commands/session-archive.ts`
  - **Spec scenario**: Session archived, No session
  - **Ladder rung**: 2 (reuse — wraps existing measureRecord())
  - **Test first**: `test('session-archive records and clears', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 3. Pipeline Integration

- [x] 1.10 Modify `src/triage/triage.ts` — resume from session if exists
  - **Spec scenario**: Resume from step
  - **Ladder rung**: 2 (reuse — check session.step, skip completed)
  - **Test first**: `test('triage resumes from session step', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/triage.test.ts`

- [x] 1.11 Modify `src/cli/index.ts` — register new commands, update USAGE
  - **Ladder rung**: 2 (reuse — follow existing pattern)
  - **Test first**: `test('session commands appear in help', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/cli.test.ts`

## 4. Skills & Docs

- [ ] 1.12 Sync `skills/veridia-*/SKILL.md` with session protocol
  - **Ladder rung**: 1 (YAGNI — docs update)
  - **Verify**: `rtk pnpm exec tsc --noEmit`

## 5. Testing

- [ ] 1.13 Test: full pipeline step-by-step via session commands
  - **Ladder rung**: 2 (reuse — follow existing e2e pattern)
  - **Test first**: `test('e2e: step-by-step session pipeline', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/e2e.test.ts`

- [ ] 1.14 Test: resume after ask interruption
  - **Ladder rung**: 2 (reuse — follow existing e2e pattern)
  - **Test first**: `test('e2e: resume pipeline after ask', ...)`
  - **Verify**: `rtk pnpm exec vitest run test/e2e.test.ts`
