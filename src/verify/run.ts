import { execFileSync } from 'node:child_process';

export interface RunResult {
  exitCode: number;
}

export type RunFn = (cwd: string, command: string) => RunResult;

const TIMEOUT_MS = 120_000;

export function runCommand(cwd: string, command: string): RunResult {
  try {
    execFileSync(command, { cwd, shell: true, timeout: TIMEOUT_MS, encoding: 'utf8' });
    return { exitCode: 0 };
  } catch (err) {
    const code = (err as { status?: number }).status;
    return { exitCode: code ?? 1 };
  }
}