/** A numeric level indicating how verifiable a target codebase is (0 = least, 3 = most). */
export type VerifiabilityLevel = 0 | 1 | 2 | 3

/** All valid verifiability level values. */
export const VERIFIABILITY_LEVELS: readonly VerifiabilityLevel[] = [0, 1, 2, 3]

/**
 * Type guard for VerifiabilityLevel.
 * @param x - The value to check.
 * @returns True if x is a valid VerifiabilityLevel.
 */
export function isVerifiabilityLevel(x: number): x is VerifiabilityLevel {
  return VERIFIABILITY_LEVELS.includes(x as VerifiabilityLevel)
}

/** The kind of verification oracle that can be detected in a target directory. */
export type OracleKind = 'test-runner' | 'type-check' | 'lint' | 'ci' | 'test-content' | 'human-review' | 'dead-code' | 'bundler'

/** All valid oracle kind values. */
export const ORACLE_KINDS: readonly OracleKind[] = ['test-runner', 'type-check', 'lint', 'ci', 'test-content', 'human-review', 'dead-code', 'bundler']

/**
 * Type guard for OracleKind.
 * @param x - The value to check.
 * @returns True if x is a valid OracleKind.
 */
export function isOracleKind(x: string): x is OracleKind {
  return ORACLE_KINDS.includes(x as OracleKind)
}

/** A detected verification oracle in the target project. */
export interface Oracle {
  /** The kind of oracle detected. */
  kind: OracleKind
  /** Whether the oracle is meaningfully present (e.g. test-content has actual test assertions). */
  present?: boolean
}

/** The result of assessing a target directory's verifiability. */
export interface Assessment {
  /** The computed verifiability level. */
  level: VerifiabilityLevel
  /** The list of detected oracles. */
  oracles: Oracle[]
}
