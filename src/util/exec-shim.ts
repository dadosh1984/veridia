import { spawnSync, type SpawnSyncOptions } from 'node:child_process'

export function execFileWithShim(cmd: string, args: string[], options: SpawnSyncOptions = {}): void {
  const result = spawnSync(cmd, args, { ...options, stdio: 'inherit' })
  if (result.error && (result.error as NodeJS.ErrnoException).code === 'ENOENT' && process.platform === 'win32') {
    const shellResult = spawnSync([cmd, ...args].join(' '), [], { ...options, shell: true, stdio: 'inherit' })
    if (shellResult.error) throw shellResult.error
    if (shellResult.status !== 0) throw Object.assign(new Error(), { status: shellResult.status })
    return
  }
  if (result.error) throw result.error
  if (result.status !== 0) throw Object.assign(new Error(), { status: result.status })
}
