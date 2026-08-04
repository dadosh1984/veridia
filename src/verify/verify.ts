import type { OracleKind, VerifiabilityLevel } from '../assess/types.js'
import { resolveCommands } from './resolve.js'
import { type RunFn, runCommand } from './run.js'
import type { Check, Verdict, VerifyResult } from './types.js'
import { baseWeight, calibrateWeight, isTestsWeak } from './weight.js'

/** Dependencies for the verify function, allowing injection of custom run logic and calibration data. */
export interface VerifyDeps {
  /** Custom run function (defaults to runCommand). */
  run?: RunFn
  /** If true, simulate verification without actually running commands. */
  dryRun?: boolean
  /** Sensitivity values per oracle kind for weight calibration. */
  sensitivity?: Record<string, number>
  /** Precision values per oracle kind for weight calibration. */
  precision?: Record<string, number>
  /** Custom weight overrides per oracle kind. */
  weights?: Record<string, number>
}

/**
 * Derive a Verdict from a list of checks and the verifiability level.
 * Level 0/1 always returns HUMAN. Level 3 requires all strong checks to pass.
 *
 * @param level - The verifiability level of the target.
 * @param checks - The list of check results.
 * @returns PASS if all checks pass, FAIL if any fail, HUMAN if level requires human judgment.
 */
export function deriveVerdict(level: VerifiabilityLevel, checks: Check[]): Verdict {
  if (level === 0 || level === 1) return 'HUMAN'
  if (checks.length === 0) return 'HUMAN'
  const strong = checks.filter((c) => !c.weak)
  if (strong.length === 0) {
    return 'HUMAN'
  }
  if (level === 3) {
    return strong.every((c) => c.passed) ? 'PASS' : 'FAIL'
  }
  return checks.every((c) => c.passed) ? 'PASS' : 'FAIL'
}

/**
 * Run verification checks for the given oracle kinds against a target directory.
 * Resolves commands, executes them (or simulates in dry-run mode), calibrates weights,
 * and derives a final verdict.
 *
 * @param target - The directory path to verify.
 * @param level - The verifiability level of the target.
 * @param kinds - The oracle kinds to run checks for.
 * @param deps - Optional dependencies (run function, dry-run, calibration data).
 * @returns A VerifyResult with checks and a verdict.
 */
export function verify(target: string, level: VerifiabilityLevel, kinds: OracleKind[], deps: VerifyDeps = {}): VerifyResult {
  const run = deps.run ?? runCommand
  const resolved = resolveCommands(kinds, target)
  const checks: Check[] = resolved.map(({ kind, command }) => {
    if (deps.dryRun) {
      return { kind, command, weight: calibrateWeight(baseWeight(kind, deps.weights), 1, 1), weak: false, passed: true }
    }
    let exitCode: number
    let error: string | undefined
    try {
      const result = run(target, command)
      exitCode = result.exitCode
      error = result.error
    } catch {
      exitCode = 1
      error = 'command failed'
    }
    const weak = kind === 'test-runner' && isTestsWeak(target)
    const bw = baseWeight(kind, deps.weights)
    const sens = deps.sensitivity?.[kind]
    const prec = deps.precision?.[kind]
    const weight = sens !== undefined && prec !== undefined ? calibrateWeight(bw, sens, prec) : bw
    return { kind, command, weight, weak, passed: exitCode === 0, error }
  })
  return { protocol: 'veridia/verification-report/v1', checks, verdict: deriveVerdict(level, checks) }
}
