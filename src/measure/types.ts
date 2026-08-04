import type { Verdict } from '../verify/types.js'

/** A single recorded measurement entry from a veridia run. */
export interface MeasureEntry {
  /** The task description. */
  task: string
  /** The classified task type. */
  type: string
  /** The assessed verifiability level. */
  level: number
  /** The final verdict of the run. */
  verdict: Verdict
  /** The individual check results. */
  checks: { kind: string; passed: boolean }[]
  /** Drift indicator string (e.g. "0", "0.5", "1"). */
  drift: string
  /** ISO timestamp of when the entry was recorded. */
  timestamp: string
  /** Optional per-oracle precision data (true/false positives). */
  oracleResults?: { kind: string; truePositives: number; falsePositives: number }[]
  /** Time in ms from task start to verdict (time-to-fix). */
  durationMs?: number
}

/** A summary of historical measurement data. */
export interface HistorySummary {
  /** Total number of recorded runs. */
  totalRuns: number
  /** Count of runs per verdict type. */
  perVerdict: Record<string, number>
  /** Count of runs per verifiability level. */
  perLevel: Record<string, number>
  /** The most recent entries (up to 5). */
  recent: MeasureEntry[]
}
