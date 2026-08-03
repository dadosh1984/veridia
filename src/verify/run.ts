import { execFileSync } from 'node:child_process';

export interface RunResult {
  exitCode: number;
}

export type RunFn = (cwd: string, command: string) => RunResult;

const TIMEOUT_MS = 120_000;

function splitCommand(command: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote: string | null = null;
  for (const ch of command) {
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ' ') {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function runCommand(cwd: string, command: string): RunResult {
  const args = splitCommand(command);
  if (args.length === 0) return { exitCode: 1 };
  const cmd = args[0];
  const cmdArgs = args.slice(1);
  try {
    execFileSync(cmd, cmdArgs, { cwd, timeout: TIMEOUT_MS, encoding: 'utf8' });
    return { exitCode: 0 };
  } catch (err) {
    const e = err as { status?: number | null; signal?: string };
    const code = e.status;
    if (code !== undefined && code !== null) return { exitCode: code };
    if (e.signal) return { exitCode: 1 };
    return { exitCode: 1 };
  }
}
