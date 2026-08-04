import { splitCommand } from '../util/split-command.js';
import { execFileWithShim } from '../util/exec-shim.js';
import path from 'node:path';

export interface RunResult {
  exitCode: number;
  error?: string;
}

export type RunFn = (cwd: string, command: string) => RunResult;

const TIMEOUT_MS = 120_000;

export function runCommand(cwd: string, command: string): RunResult {
  const args = splitCommand(command);
  if (args.length === 0) return { exitCode: 1 };
  const cmd = args[0];
  const cmdArgs = args.slice(1);
  const env = { ...process.env, PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH ?? ''}` };
  try {
    execFileWithShim(cmd, cmdArgs, { cwd, timeout: TIMEOUT_MS, encoding: 'utf8', env });
    return { exitCode: 0 };
  } catch (err) {
    const e = err as { status?: number | null; signal?: string; stderr?: string; code?: string; message?: string };
    const code = e.status;
    if (code !== undefined && code !== null) {
      return { exitCode: code, error: e.stderr?.trim() || undefined };
    }
    const message = e.message || (e.code ? `command failed (${e.code})` : undefined);
    return { exitCode: 1, error: message?.trim() || undefined };
  }
}
