import { spawnSync } from 'node:child_process'
import { splitCommand } from '../util/split-command.js'
import path from 'node:path'

export interface RunResult {
  exitCode: number
  error?: string
}

export type RunFn = (cwd: string, command: string) => RunResult

const TIMEOUT_MS = 120_000

export function runCommand(cwd: string, command: string): RunResult {
  const args = splitCommand(command)
  if (args.length === 0) return { exitCode: 1 }
  const cmd = args[0]
  const cmdArgs = args.slice(1)
  const env = { ...process.env, PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH ?? ''}` }
  const result = spawnSync(cmd, cmdArgs, {
    cwd,
    timeout: TIMEOUT_MS,
    encoding: 'utf8',
    env,
    stdio: ['inherit', 'inherit', 'pipe'],
  })
  if (result.error) {
    return { exitCode: result.status ?? 1, error: result.error.message }
  }
  return { exitCode: result.status ?? 1, error: result.stderr?.trim() || undefined }
}
