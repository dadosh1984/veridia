## Context

See proposal.md — Why. The `review` subcommand currently only lists files. Users expect actual bug/security/quality findings. A static analyzer with pluggable checks (regex-based, no AST) can detect common issues without any AI or dependencies.

## Goals / Non-Goals

**Goals:**
- `veridia review --target .` runs static analysis AND outputs agent instructions
- Findings: hardcoded secrets, missing try/catch, dangerous patterns, type safety issues
- Severity levels: ERROR, WARNING, INFO
- Zero new dependencies

**Non-Goals:**
- No AST parsing or deep semantic analysis
- No false-positive-free guarantees (regex-based = some noise)
- No auto-fix — findings only

## Decisions

1. **Pluggable checkers** — Each checker is a function `(filePath, content) => Finding[]`. Easy to add/remove without changing the core.

2. **Regex-based detection** — No AST = no dependencies. Patterns like `/(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']+/i` catch 80% of hardcoded secrets.

3. **Combined review output** — `veridia review` now outputs both analysis findings AND agent instructions in one JSON object.

4. **Checkers implemented:**
   - `checkHardcodedSecrets` — API keys, tokens, passwords in source
   - `checkMissingTryCatch` — `readFileSync`, `JSON.parse`, `readdirSync` without try/catch
   - `checkDangerousPatterns` — `eval`, `shell: true`, `exec`, `Function(`
   - `checkConsoleLog` — `console.log` left in production code (INFO)
   - `checkTodo` — `TODO`, `FIXME`, `HACK` comments (INFO)

## Risks / Trade-offs

- [Risk] Regex false positives → Mitigation: severity levels let users filter; patterns are conservative
- [Risk] Missing try/catch detection is heuristic → Mitigation: only flag known-dangerous calls without try/catch in the same function

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| Checker functions | 3 (Stdlib) | `readFileSync` + regex — no deps |
| Finding types | 3 (Stdlib) | Plain TypeScript interfaces |
| Combined review | 2 (Reuse) | Extends existing `buildReviewInstructions` |
