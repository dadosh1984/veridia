import type { MeasureEntry, HistorySummary } from './types.js';
import { appendEntry, readHistory, buildSummary } from './history.js';
import type { HistoryDeps } from './history.js';

export interface MeasureDeps extends HistoryDeps {}

export function measureRecord(
  entry: Omit<MeasureEntry, 'timestamp'>,
  deps: MeasureDeps = {},
): void {
  appendEntry(entry, deps);
}

export function measureHistory(deps: MeasureDeps = {}): HistorySummary {
  const entries = readHistory(deps);
  return buildSummary(entries);
}
