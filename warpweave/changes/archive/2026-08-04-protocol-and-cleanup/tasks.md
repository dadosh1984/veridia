## 1. Protocol Fields

- [x] 1.1 Add `protocol` field to ExecutionPlan in `src/execute/types.ts`
- [x] 1.2 Add `protocol` field to VerifyResult in `src/verify/types.ts`
- [x] 1.3 Add `protocol` field to LearnResult in `src/measure/learn.ts`

## 2. Protocol Documentation

- [x] 2.1 Create `docs/protocol/execution-plan.md`
- [x] 2.2 Create `docs/protocol/verification-report.md`
- [x] 2.3 Create `docs/protocol/learn-result.md`

## 3. Bug Fixes

- [x] 3.1 Fix hardcoded classify patterns — add `\b` word boundaries
- [x] 3.2 Fix delegation priority — prefer file over stdout
- [x] 3.3 Fix gate commands — read test script from package.json

## 4. Dead Code Removal

- [x] 4.1 Remove `models` and `workflows` from `src/config/config.ts`
- [x] 4.2 Remove `AgentInstruction` interface from `src/agent/types.ts`
- [x] 4.3 Remove `'ai-ready'` from `OrchestrationDepth` in `src/route/types.ts`
- [x] 4.4 Remove unused `readFileSync` import from `src/analyze/checks.ts`
