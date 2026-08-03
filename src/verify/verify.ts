import type { OracleKind, VerifiabilityLevel } from '../assess/types.js';
import { resolveCommands } from './resolve.js';
import { runCommand, type RunFn } from './run.js';
import type { Check, Verdict, VerifyResult } from './types.js';
import { baseWeight, isTestsWeak } from './weight.js';

export interface VerifyDeps {
  run?: RunFn;
  dryRun?: boolean;
}

export function deriveVerdict(level: VerifiabilityLevel, checks: Check[]): Verdict {
  if (level === 0 || level === 1) return 'HUMAN';
  if (checks.length === 0) return 'HUMAN';
  const strong = checks.filter((c) => !c.weak);
  if (strong.length === 0) {
    if (level === 3) return 'HUMAN';
    return checks.every((c) => c.passed) ? 'HUMAN' : 'FAIL';
  }
  if (level === 3) {
    return strong.every((c) => c.passed) ? 'PASS' : 'FAIL';
  }
  return checks.every((c) => c.passed) ? 'PASS' : 'FAIL';
}

export function verify(
  target: string,
  level: VerifiabilityLevel,
  kinds: OracleKind[],
  deps: VerifyDeps = {},
): VerifyResult {
  const run = deps.run ?? runCommand;
  const resolved = resolveCommands(kinds, target);
  const checks: Check[] = resolved.map(({ kind, command }) => {
    if (deps.dryRun) {
      return { kind, command, weight: baseWeight(kind), weak: false, passed: true };
    }
    let exitCode: number;
    try {
      const result = run(target, command);
      exitCode = result.exitCode;
    } catch {
      exitCode = 1;
    }
    const weak = kind === 'test-runner' && isTestsWeak(target);
    return { kind, command, weight: baseWeight(kind), weak, passed: exitCode === 0 };
  });
  return { protocol: 'veridia/verification-report/v1', checks, verdict: deriveVerdict(level, checks) };
}
