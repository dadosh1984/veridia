import type { OracleKind } from '../assess/types.js'

/** The final verdict of a verification run. */
export type Verdict = 'PASS' | 'FAIL' | 'HUMAN'

/** A single verification check result. */
export interface Check {
  /** The kind of oracle that performed this check. */
  kind: OracleKind
  /** The shell command that was executed for this check. */
  command: string
  /** The weight of this check in the overall verification. */
  weight: number
  /** Whether this check is considered weak (e.g. tests without meaningful assertions). */
  weak: boolean
  /** Whether the check passed (exit code 0). */
  passed: boolean
  /** Optional error message if the check failed. */
  error?: string
}

/** The result of a verification run. */
export interface VerifyResult {
  /** Protocol identifier for the verification report format. */
  protocol: 'veridia/verification-report/v1'
  /** The list of individual check results. */
  checks: Check[]
  /** The overall verdict derived from all checks. */
  verdict: Verdict
}
