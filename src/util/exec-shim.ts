import { spawnSync, type SpawnSyncOptions } from 'node:child_process'

export function execFileWithShim(cmd: string, args: string[], options: SpawnSyncOptions = {}): void {
  const result = spawnSync(cmd, args, { ...options, stdio: ['inherit', 'inherit', 'pipe'] })
  if (result.error && (result.error as NodeJS.ErrnoException).code === 'ENOENT' && process.platform === 'win32') {
    const shellCmd = [cmd, ...args].map((p) => (p.includes(' ') ? `"${p}"` : p)).join(' ')
    const shellResult = spawnSync(shellCmd, [], { ...options, shell: true, stdio: ['inherit', 'inherit', 'pipe'] })
    if (shellResult.error) throw shellResult.error
    if (shellResult.status !== 0) {
      const e = new Error(shellResult.stderr?.toString().trim() || `exit code ${shellResult.status}`) as Error & { status: number; stderr: string }
      e.status = shellResult.status
      e.stderr = shellResult.stderr?.toString() || ''
      throw e
    }
    return
  }
  if (result.error) throw result.error
  if (result.status !== 0) {
    const e = new Error(result.stderr?.toString().trim() || `exit code ${result.status}`) as Error & { status: number; stderr: string }
    e.status = result.status
    e.stderr = result.stderr?.toString() || ''
    throw e
  }
}
