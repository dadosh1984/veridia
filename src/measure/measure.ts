import type { HistoryDeps } from './history.js'
import { appendEntry, buildSummary, readHistory } from './history.js'
import type { HistorySummary, MeasureEntry } from './types.js'

/** Dependencies for measurement functions. */
export type MeasureDeps = HistoryDeps

/**
 * Record a measurement entry by appending it to the history file with a timestamp.
 *
 * @param entry - The measurement entry data (timestamp is added automatically).
 * @param deps - Optional dependencies (e.g. custom root directory).
 */
export function measureRecord(entry: Omit<MeasureEntry, 'timestamp'>, deps: MeasureDeps = {}): void {
  appendEntry(entry, deps)
}

/**
 * Read all history entries and build a summary of past runs.
 *
 * @param deps - Optional dependencies (e.g. custom root directory).
 * @returns A HistorySummary with totals, per-verdict counts, per-level counts, and recent entries.
 */
export function measureHistory(deps: MeasureDeps = {}): HistorySummary {
  const entries = readHistory(deps)
  return buildSummary(entries)
}
