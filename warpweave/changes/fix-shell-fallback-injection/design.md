# Design: fix-shell-fallback-injection

## Context

See proposal.md — Why. The Windows fallback in `src/util/exec-shim.ts:15-27` triggers only when `spawnSync(cmd, ...)` returns `ENOENT` on win32. Its purpose is to make `.cmd` shims (which `spawn` cannot execute directly without a shell) runnable. The current fix quotes args and re-runs through `shell: true`, which is both self-flagging (`checks.ts:9`) and injection-prone (`p.includes(' ') ? `"${p}"` : p`).

## Goals / Non-Goals

**Goals:**
- Run `.cmd`/`.exe`/`.bat` shims on Windows without a raw shell
- Preserve exact arg boundaries for args containing spaces/special chars
- Eliminate every `shell: true` from `src/`

**Non-Goals:**
- Not supporting shell syntax in gate commands (gates are `splitCommand`-parsed, not shell strings)
- Not changing which commands run or their output handling (that is the `machine-output` change)

## Decisions

### Decision 1: native PATHEXT resolution, not cross-spawn

When `ENOENT` occurs on win32, resolve the command manually:
1. If `cmd` contains a path separator, probe `cmd + ext` for each ext in `PATHEXT` (default `;.COM;.EXE;.BAT;.CMD`) and pick the first that `existsSync`.
2. Else walk each dir in `PATH` (plus `node_modules/.bin`), same ext probe.
3. Spawn the resolved absolute path with `spawnSync(resolved, args, { ...options, shell: false })`.

Alternatives considered:
- **cross-spawn** (rung 5 dependency) — rejected: the stdlib walk is ~20 lines, covers `.cmd`/.exe/.bat, and keeps zero runtime deps. The ladder stops at rung 4 (native).
- **Keep `shell: true` but escape args** — rejected: escaping for cmd.exe is notoriously incomplete; `shell: false` + resolved path is the only robust guarantee.

### Decision 2: rethrow/exit semantics preserved

If resolution finds nothing, throw the original `ENOENT` error so callers (e.g. `runCommand`, `runGates`) behave exactly as before for genuinely missing commands. The success path returns through the same non-zero-exit code path.

## Risks / Trade-offs

- [Windows-only resolution path may have edge cases (PATHEXT absent, spaces in PATH dirs)] → Mitigation: `PATHEXT` default `';.COM;.EXE;.BAT;.CMD'` when unset; `existsSync` handles spaces in dirs since it's a path check, not a string split.
- [`.cmd` shims still require the OS cmd.exe internally even with `shell: false`] → Mitigation: this is inherent to `.cmd` files on Windows; `spawn` handles `.cmd` by invoking `cmd.exe /d /s /c` internally when given the file path — no user-injected shell string is involved.
- [Behavior change on Windows] → Mitigation: gated on the old condition (`ENOENT` + win32); POSIX path is untouched.

## Migration Plan

Single change; rollback is a revert. Existing `execFileWithShim` callers unchanged.

## Open Questions

None.
