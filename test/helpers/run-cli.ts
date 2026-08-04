import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))

export interface CliResult {
  stdout: string
  stderr: string
  exitCode: number
}

export function runCli(...args: string[]): CliResult {
  const entry = path.join(projectRoot, 'dist', 'cli', 'index.js')
  try {
    const stdout = execFileSync(process.execPath, [entry, ...args], {
      encoding: 'utf8',
    })
    return { stdout, stderr: '', exitCode: 0 }
  } catch (err) {
    const error = err as { status?: number; stdout?: string; stderr?: string }
    return {
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
      exitCode: error.status ?? 1,
    }
  }
}

export function runCliIn(cwd: string, ...args: string[]): CliResult {
  const entry = path.join(projectRoot, 'dist', 'cli', 'index.js')
  try {
    const stdout = execFileSync(process.execPath, [entry, ...args], {
      cwd,
      encoding: 'utf8',
    })
    return { stdout, stderr: '', exitCode: 0 }
  } catch (err) {
    const error = err as { status?: number; stdout?: string; stderr?: string }
    return {
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
      exitCode: error.status ?? 1,
    }
  }
}
