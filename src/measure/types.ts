import type { Verdict } from '../verify/types.js';

export interface MeasureEntry {
  task: string;
  type: string;
  level: number;
  verdict: Verdict;
  checks: { kind: string; passed: boolean }[];
  drift: string;
  timestamp: string;
}

export interface HistorySummary {
  totalRuns: number;
  perVerdict: Record<string, number>;
  perLevel: Record<string, number>;
  recent: MeasureEntry[];
}
