import path from 'node:path'
import { type ExecShimOptions, execFileWithShim } from '../util/exec-shim.js'
import { splitCommand } from '../util/split-command.js'

/** The result of running a shell command. */
export interface RunResult {
  /** The exit code of the command (0 for success). */
  exitCode: number
  /** Optional error message if the command failed. */
  error?: string
  /** Captured stdout of the child process. */
  stdout?: string
}

/** Options for running a shell command. */
export interface RunOptions {
  /** If true, inherit stderr for real-time output. */
  streamOutput?: boolean
}

/** A function type for running a shell command in a given working directory. */
export type RunFn = (cwd: string, command: string, options?: RunOptions) => RunResult

const TIMEOUT_MS = 120_000

/**
 * Run a shell command in the given working directory and return the result.
 * Uses execFileWithShim for cross-platform compatibility.
 *
 * @param cwd - The working directory to run the command in.
 * @param command - The command string to execute.
 * @param options - Optional run options (streamOutput).
 * @returns A RunResult with the exit code and optional error.
 */
export function runCommand(cwd: string, command: string, options?: RunOptions): RunResult {
  const args = splitCommand(command)
  if (args.length === 0) return { exitCode: 1 }
  const cmd = args[0]
  const cmdArgs = args.slice(1)
  const env = { ...process.env, PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH ?? ''}` }
  if (!cmd) return { exitCode: 1 }
  const shimOpts: ExecShimOptions = { cwd, timeout: TIMEOUT_MS, encoding: 'utf8', env, streamOutput: options?.streamOutput }
  try {
    const stdout = execFileWithShim(cmd, cmdArgs, shimOpts)
    return { exitCode: 0, stdout }
  } catch (err) {
    const e = err as { status?: number | null; signal?: string; stderr?: string; stdout?: string; code?: string; message?: string }
    const code = e.status
    if (code !== undefined && code !== null) {
      return { exitCode: code, error: e.stderr?.trim() || undefined, stdout: e.stdout }
    }
    const message = e.message || (e.code ? `command failed (${e.code})` : undefined)
    return { exitCode: 1, error: message?.trim() || undefined }
  }
}
