import type { OracleKind, VerifiabilityLevel } from '../assess/types.js';
import { resolveCommands } from './resolve.js';
import { runCommand, type RunFn } from './run.js';
import type { Check, Verdict, VerifyResult } from './types.js';
import { baseWeight, calibrateWeight, isTestsWeak } from './weight.js';

export interface VerifyDeps {
  run?: RunFn;
  dryRun?: boolean;
  sensitivity?: Record<string, number>;
  precision?: Record<string, number>;
  weights?: Record<string, number>;
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
      return { kind, command, weight: calibrateWeight(baseWeight(kind, deps.weights), 1, 1), weak: false, passed: true };
    }
    let exitCode: number;
    let error: string | undefined;
    try {
      const result = run(target, command);
      exitCode = result.exitCode;
      error = result.error;
    } catch {
      exitCode = 1;
      error = 'command failed';
    }
    const weak = kind === 'test-runner' && isTestsWeak(target);
    const bw = baseWeight(kind, deps.weights);
    const sens = deps.sensitivity?.[kind];
    const prec = deps.precision?.[kind];
    const weight = sens !== undefined && prec !== undefined ? calibrateWeight(bw, sens, prec) : bw;
    return { kind, command, weight, weak, passed: exitCode === 0, error };
  });
  return { protocol: 'veridia/verification-report/v1', checks, verdict: deriveVerdict(level, checks) };
}
