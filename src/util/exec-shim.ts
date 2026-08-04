import { type SpawnSyncOptions, spawnSync } from 'node:child_process'

/**
 * Execute a file with cross-platform shim support.
 * On Windows, if the command is not found directly, retries with shell: true.
 * Throws on non-zero exit codes with the stderr as the error message.
 *
 * @param cmd - The command to execute.
 * @param args - The command arguments.
 * @param options - Spawn options (cwd, timeout, encoding, env).
 * @throws If the command fails or exits with a non-zero code.
 */
export function execFileWithShim(cmd: string, args: string[], options: SpawnSyncOptions = {}): void {
  const result = spawnSync(cmd, args, { ...options, stdio: ['inherit', 'pipe', 'pipe'] })
  if (result.error && (result.error as NodeJS.ErrnoException).code === 'ENOENT' && process.platform === 'win32') {
    const shellCmd = [cmd, ...args].map((p) => (p.includes(' ') ? `"${p}"` : p)).join(' ')
    const shellResult = spawnSync(shellCmd, [], { ...options, shell: true, stdio: ['inherit', 'pipe', 'pipe'] })
    if (shellResult.error) throw shellResult.error
    const code = shellResult.status ?? 1
    if (code !== 0) {
      const e = new Error(shellResult.stderr?.toString().trim() || `exit code ${code}`) as Error & { status: number; stderr: string }
      e.status = code
      e.stderr = shellResult.stderr?.toString() || ''
      throw e
    }
    return
  }
  if (result.error) throw result.error
  const code = result.status ?? 1
  if (code !== 0) {
    const e = new Error(result.stderr?.toString().trim() || `exit code ${code}`) as Error & { status: number; stderr: string }
    e.status = code
    e.stderr = result.stderr?.toString() || ''
    throw e
  }
}
