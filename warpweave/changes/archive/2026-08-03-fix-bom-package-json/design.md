## Context

- See proposal.md - Why; specs/assess/spec.md + specs/verify/spec.md - behavior contract.
- Bug (found in stage-5 smoke): a UTF-8 BOM before `package.json` content breaks `JSON.parse` in oracle detection/resolution. PowerShell `Set-Content -Encoding utf8` writes a BOM, so this hits the Windows first-class target.
- Affected: `src/assess/probe.ts` `hasScript` (Stage 2) and `src/verify/resolve.ts` `readScript` (Stage 5), both parse `package.json`.

## Goals / Non-Goals

**Goals:**
- A single stdlib `stripBom` helper reused by both call sites.
- BOM'd `package.json` behaves identically to BOM-free in oracle detection and command resolution.

**Non-Goals:**
- Handling other encodings (only UTF-8 BOM).
- Changing the manifest contents or writing back to disk.

## Decisions

**D1. Shared helper in `src/util/stripBom.ts`.**
`export function stripBom(text: string): string` returns `text` with a single leading `\uFEFF` removed. Trivial expression, one place, reused.
- Alternatives: inline `/\uFEFF/` in both files (rejected — duplicates a one-liner across two modules).

**D2. Apply strip before `JSON.parse`.**
Both `hasScript` (probe.ts) and `readScript` (resolve.ts) call `stripBom(raw)` before `JSON.parse(raw)`.
- Alternatives: strip inside a shared JSON reader (rejected — the two sites read differently; helper keeps the change minimal).

**D3. No behavior change for BOM-free files.**
`stripBom` returns the input unchanged when there is no BOM, so all existing tests and flows keep passing unchanged.

## Risks / Trade-offs

- None material — the helper is idempotent and stdlib-only.

## Ladder Trace

| Component | Rung | Decision |
|-----------|------|----------|
| BOM strip helper | 6 One-liner | `str.charCodeAt(0) === 0xfeff ? str.slice(1) : str` |
| Wiring into probe + resolve | 2 Reuse | one helper, two call sites |
| Tests | 2 Reuse | add BOM fixtures alongside existing |