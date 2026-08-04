import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import type { Verdict } from '../verify/types.js'

/** The current step in a veridia session workflow. */
export type SessionStep = 'classify' | 'assess' | 'route' | 'ask' | 'do' | 'done'

/** Persisted session state for resuming interrupted veridia runs. */
export interface Session {
  /** The task description. */
  task: string
  /** The classified task type. */
  type?: TaskType
  /** The classification confidence. */
  confidence?: number
  /** The assessed verifiability level. */
  level?: VerifiabilityLevel
  /** The run plan details. */
  plan?: {
    /** The orchestration depth. */
    depth: string
    /** The model tier. */
    tier: string
    /** The ordered step identifiers. */
    steps: string[]
    /** The verification check identifiers. */
    checks: string[]
  }
  /** Optional answers from the ask phase. */
  answers?: Record<string, string>
  /** Optional final verdict. */
  verdict?: Verdict
  /** The current session step. */
  step: SessionStep
}
