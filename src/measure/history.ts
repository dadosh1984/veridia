import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MeasureEntry, HistorySummary } from './types.js';

export interface HistoryDeps {
  root?: string;
}

function historyDir(root: string): string {
  return join(root, '.veridia');
}

function historyFile(root: string): string {
  return join(historyDir(root), 'history.jsonl');
}

export function appendEntry(entry: Omit<MeasureEntry, 'timestamp'>, deps: HistoryDeps = {}): void {
  const root = deps.root ?? process.cwd();
  const dir = historyDir(root);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const full: MeasureEntry = { ...entry, timestamp: new Date().toISOString() };
  appendFileSync(historyFile(root), JSON.stringify(full) + '\n', 'utf8');
}

export function readHistory(deps: HistoryDeps = {}): MeasureEntry[] {
  const root = deps.root ?? process.cwd();
  const file = historyFile(root);
  if (!existsSync(file)) return [];
  const content = readFileSync(file, 'utf8').trim();
  if (content === '') return [];
  return content.split('\n').map((line) => JSON.parse(line) as MeasureEntry);
}

export function buildSummary(entries: MeasureEntry[]): HistorySummary {
  const perVerdict: Record<string, number> = {};
  const perLevel: Record<string, number> = {};
  for (const e of entries) {
    perVerdict[e.verdict] = (perVerdict[e.verdict] ?? 0) + 1;
    const lk = String(e.level);
    perLevel[lk] = (perLevel[lk] ?? 0) + 1;
  }
  return {
    totalRuns: entries.length,
    perVerdict,
    perLevel,
    recent: entries.slice(-5),
  };
}
