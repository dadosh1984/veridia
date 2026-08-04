import { type HistoryDeps, readHistory } from './history.js'
import type { MeasureEntry } from './types.js'

/** The result of learning from historical measurement data. */
export interface LearnResult {
  /** Protocol identifier for the learn result format. */
  protocol: 'veridia/learn-result/v1'
  /** Total number of runs analyzed. */
  totalRuns: number
  /** Classification accuracy per task type. */
  classificationAccuracy: Record<string, number>
  /** Success rate per verifiability level. */
  successRateByLevel: Record<string, number>
  /** List of drift patterns detected. */
  driftPatterns: string[]
  /** Actionable recommendations based on the analysis. */
  recommendations: string[]
  /** Precision per oracle kind. */
  oraclePrecision: Record<string, number>
}

/**
 * Compute precision per oracle kind from historical measurement entries.
 * Precision = truePositives / (truePositives + falsePositives).
 *
 * @param entries - The measurement entries to analyze.
 * @returns A map of oracle kind to precision score (0-1).
 */
export function computePrecision(entries: MeasureEntry[]): Record<string, number> {
  const tp: Record<string, number> = {}
  const fp: Record<string, number> = {}
  for (const entry of entries) {
    if (!entry.oracleResults) continue
    for (const r of entry.oracleResults) {
      tp[r.kind] = (tp[r.kind] ?? 0) + r.truePositives
      fp[r.kind] = (fp[r.kind] ?? 0) + r.falsePositives
    }
  }
  const precision: Record<string, number> = {}
  for (const kind of Object.keys(tp)) {
    const tpVal = tp[kind] ?? 0
    const fpVal = fp[kind] ?? 0
    const total = tpVal + fpVal
    precision[kind] = total > 0 ? Math.round((tpVal / total) * 100) / 100 : 0
  }
  return precision
}

/**
 * Analyze historical measurement data to compute classification accuracy,
 * success rates, drift patterns, and generate recommendations.
 *
 * @param deps - Optional dependencies (e.g. custom root directory).
 * @returns A LearnResult with analysis data and recommendations.
 */
export function learn(deps: HistoryDeps = {}): LearnResult {
  const entries = readHistory(deps)
  if (entries.length === 0) {
    return {
      protocol: 'veridia/learn-result/v1',
      totalRuns: 0,
      classificationAccuracy: {},
      successRateByLevel: {},
      driftPatterns: [],
      recommendations: ['No history data yet. Run veridia <task> to start collecting data.'],
      oraclePrecision: {},
    }
  }

  const byType: Record<string, MeasureEntry[]> = {}
  const byLevel: Record<string, MeasureEntry[]> = {}
  const driftEntries: string[] = []

  for (const entry of entries) {
    const t = entry.type || 'unknown'
    if (!byType[t]) byType[t] = []
    byType[t].push(entry)

    const lk = String(entry.level)
    if (!byLevel[lk]) byLevel[lk] = []
    byLevel[lk].push(entry)

    if (entry.drift && entry.drift !== '0') {
      driftEntries.push(`${entry.task}: drift=${entry.drift} (type=${entry.type}, level=${entry.level})`)
    }
  }

  const classificationAccuracy: Record<string, number> = {}
  for (const [type, typeEntries] of Object.entries(byType)) {
    const passed = typeEntries.filter((e) => e.verdict === 'PASS').length
    classificationAccuracy[type] = Math.round((passed / typeEntries.length) * 100) / 100
  }

  const successRateByLevel: Record<string, number> = {}
  for (const [level, levelEntries] of Object.entries(byLevel)) {
    const passed = levelEntries.filter((e) => e.verdict === 'PASS').length
    successRateByLevel[level] = Math.round((passed / levelEntries.length) * 100) / 100
  }

  const recommendations: string[] = []
  const patternsToAdjust: string[] = []
  for (const [type, accuracy] of Object.entries(classificationAccuracy)) {
    if (accuracy < 0.7) {
      recommendations.push(
        `Classification accuracy for '${type}' is low (${(accuracy * 100).toFixed(0)}%). Consider adjusting patterns in .veridia/config.json.`,
      )
      patternsToAdjust.push(type)
    }
  }
  for (const [level, rate] of Object.entries(successRateByLevel)) {
    if (rate < 0.5) {
      recommendations.push(`Level ${level} has low success rate (${(rate * 100).toFixed(0)}%). Consider using a more expensive model tier.`)
    }
  }
  if (driftEntries.length > 0) {
    recommendations.push(`${driftEntries.length} run(s) had non-zero drift. Review intent vs actual outcome.`)
  }
  if (recommendations.length === 0) {
    recommendations.push('No issues detected. All metrics look healthy.')
  }

  return {
    protocol: 'veridia/learn-result/v1',
    totalRuns: entries.length,
    classificationAccuracy,
    successRateByLevel,
    driftPatterns: driftEntries,
    recommendations,
    oraclePrecision: computePrecision(entries),
  }
}
