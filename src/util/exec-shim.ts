import { type SpawnSyncOptions, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { delimiter, join, sep } from 'node:path'

/**
 * Escape a single argument for cmd.exe: wrap in double quotes and escape
 * embedded double quotes by doubling them.
 */
function escapeWinArg(a: string): string {
  return `"${a.replace(/"/g, '""')}"`
}

/**
 * Resolve a command name to its full path using PATHEXT on Windows.
 * Probes each extension in PATHEXT against PATH dirs and node_modules/.bin.
 *
 * @param cmd - The command name (may include extension).
 * @param cwd - Working directory for node_modules/.bin resolution.
 * @returns The resolved full path, or undefined if not found.
 */
function resolveShim(cmd: string, cwd?: string): string | undefined {
  const pathext = (process.env.PATHEXT ?? ';.COM;.EXE;.BAT;.CMD').toLowerCase().split(';').filter(Boolean)
  const hasSep = cmd.includes(sep) || cmd.includes('/')
  const dirs: string[] = []
  if (hasSep) {
    const dir = cmd.includes(sep) ? cmd.slice(0, cmd.lastIndexOf(sep)) : cmd.slice(0, cmd.lastIndexOf('/'))
    dirs.push(dir)
  } else {
    dirs.push(...(process.env.PATH ?? '').split(delimiter).filter(Boolean))
    if (cwd) dirs.push(join(cwd, 'node_modules', '.bin'))
  }
  const base = hasSep ? cmd.slice(Math.max(cmd.lastIndexOf(sep), cmd.lastIndexOf('/')) + 1) : cmd
  const cmdLower = base.toLowerCase()
  const hasExt = pathext.some((ext) => cmdLower.endsWith(ext))
  for (const dir of dirs) {
    if (hasExt) {
      const candidate = join(dir, base)
      if (existsSync(candidate)) return candidate
    }
    for (const ext of pathext) {
      const candidate = join(dir, `${base}${ext}`)
      if (existsSync(candidate)) return candidate
    }
  }
  return undefined
}

/**
 * Execute a file with cross-platform shim support.
 * On Windows, if the command is not found directly, resolves .cmd/.exe/.bat
 * shims via PATHEXT against PATH and node_modules/.bin.
 * Throws on non-zero exit codes with the stderr as the error message.
 * Returns the captured stdout of the child process.
 *
 * @param cmd - The command to execute.
 * @param args - The command arguments.
 * @param options - Spawn options (cwd, timeout, encoding, env).
 * @returns The captured stdout of the child process.
 * @throws If the command fails or exits with a non-zero code.
 */
export function execFileWithShim(cmd: string, args: string[], options: SpawnSyncOptions = {}): string {
  let result: ReturnType<typeof spawnSync>
  try {
    result = spawnSync(cmd, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (err) {
    if (process.platform === 'win32') {
      const resolved = resolveShim(cmd, options.cwd as string | undefined)
      if (resolved) {
        const needsShell = /\.(cmd|bat)$/i.test(resolved)
        let shimResult: ReturnType<typeof spawnSync>
        if (needsShell) {
          const cmdLine = `"${resolved}" ${args.map(escapeWinArg).join(' ')}`
          shimResult = spawnSync(cmdLine, [], { ...options, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
        } else {
          shimResult = spawnSync(resolved, args, { ...options, shell: false, stdio: ['ignore', 'pipe', 'pipe'] })
        }
        if (shimResult.error) throw shimResult.error
        const code = shimResult.status ?? 1
        if (code !== 0) {
          const e = new Error(shimResult.stderr?.toString().trim() || `exit code ${code}`) as Error & { status: number; stderr: string; stdout: string }
          e.status = code
          e.stderr = shimResult.stderr?.toString() || ''
          e.stdout = shimResult.stdout?.toString() || ''
          throw e
        }
        return shimResult.stdout?.toString() ?? ''
      }
    }
    throw err
  }
  if (result.error && process.platform === 'win32' && ['ENOENT', 'EINVAL', 'EFTYPE'].includes((result.error as NodeJS.ErrnoException).code ?? '')) {
    const resolved = resolveShim(cmd, options.cwd as string | undefined)
    if (!resolved) throw result.error
    const needsShell = /\.(cmd|bat)$/i.test(resolved)
    let shimResult: ReturnType<typeof spawnSync>
    if (needsShell) {
      const cmdLine = `"${resolved}" ${args.map(escapeWinArg).join(' ')}`
      shimResult = spawnSync(cmdLine, [], { ...options, shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
    } else {
      shimResult = spawnSync(resolved, args, { ...options, shell: false, stdio: ['ignore', 'pipe', 'pipe'] })
    }
    if (shimResult.error) throw shimResult.error
    const code = shimResult.status ?? 1
    if (code !== 0) {
      const e = new Error(shimResult.stderr?.toString().trim() || `exit code ${code}`) as Error & { status: number; stderr: string; stdout: string }
      e.status = code
      e.stderr = shimResult.stderr?.toString() || ''
      e.stdout = shimResult.stdout?.toString() || ''
      throw e
    }
    return shimResult.stdout?.toString() ?? ''
  }
  if (result.error) throw result.error
  const code = result.status ?? 1
  if (code !== 0) {
    const e = new Error(result.stderr?.toString().trim() || `exit code ${code}`) as Error & { status: number; stderr: string; stdout: string }
    e.status = code
    e.stderr = result.stderr?.toString() || ''
    e.stdout = result.stdout?.toString() || ''
    throw e
  }
  return result.stdout?.toString() ?? ''
}
