import type { Verdict } from '../verify/types.js';

export interface MeasureEntry {
  task: string;
  type: string;
  level: number;
  verdict: Verdict;
  checks: { kind: string; passed: boolean }[];
  drift: string;
  timestamp: string;
  oracleResults?: { kind: string; truePositives: number; falsePositives: number }[];
}

export interface HistorySummary {
  totalRuns: number;
  perVerdict: Record<string, number>;
  perLevel: Record<string, number>;
  recent: MeasureEntry[];
}
