import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { MeasureEntry, HistorySummary } from '../src/measure/types.js';
import { appendEntry, readHistory, buildSummary } from '../src/measure/history.js';
import { measureRecord, measureHistory } from '../src/measure/measure.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-measure-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('appendEntry', () => {
  it('writes a JSONL line to .veridia/history.jsonl', () => {
    const root = makeTmpDir();
    const entry = { task: 'add auth', type: 'feature', level: 2, verdict: 'PASS' as const, checks: [], drift: '' };
    appendEntry(entry, { root });
    const file = path.join(root, '.veridia', 'history.jsonl');
    expect(fs.existsSync(file)).toBe(true);
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]) as MeasureEntry;
    expect(parsed.task).toBe('add auth');
    expect(parsed.verdict).toBe('PASS');
    expect(parsed.timestamp).toBeDefined();
  });

  it('accepts oracleResults field', () => {
    const root = makeTmpDir();
    const entry = {
      task: 'test', type: 'feature', level: 2, verdict: 'PASS' as const,
      checks: [{ kind: 'test-runner', passed: true }], drift: '',
      oracleResults: [{ kind: 'test-runner', truePositives: 5, falsePositives: 1 }],
    };
    appendEntry(entry, { root });
    const entries = readHistory({ root });
    expect(entries[0].oracleResults).toEqual([{ kind: 'test-runner', truePositives: 5, falsePositives: 1 }]);
  });

  it('creates .veridia directory if it does not exist', () => {
    const root = makeTmpDir();
    const entry = { task: 'fix bug', type: 'bugfix', level: 3, verdict: 'FAIL' as const, checks: [], drift: '' };
    appendEntry(entry, { root });
    expect(fs.existsSync(path.join(root, '.veridia'))).toBe(true);
  });
});

describe('readHistory', () => {
  it('returns an empty array when no history file exists', () => {
    const root = makeTmpDir();
    expect(readHistory({ root })).toEqual([]);
  });

  it('returns parsed entries from the history file', () => {
    const root = makeTmpDir();
    const entry = { task: 'add auth', type: 'feature', level: 2, verdict: 'PASS' as const, checks: [], drift: '' };
    appendEntry(entry, { root });
    const entries = readHistory({ root });
    expect(entries).toHaveLength(1);
    expect(entries[0].task).toBe('add auth');
  });
});

describe('buildSummary', () => {
  it('builds a summary from entries', () => {
    const entries: MeasureEntry[] = [
      { task: 'a', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '', timestamp: '2026-01-01T00:00:00.000Z' },
      { task: 'b', type: 'bugfix', level: 3, verdict: 'FAIL', checks: [], drift: '', timestamp: '2026-01-02T00:00:00.000Z' },
      { task: 'c', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '', timestamp: '2026-01-03T00:00:00.000Z' },
    ];
    const summary = buildSummary(entries);
    expect(summary.totalRuns).toBe(3);
    expect(summary.perVerdict).toEqual({ PASS: 2, FAIL: 1 });
    expect(summary.perLevel).toEqual({ '2': 2, '3': 1 });
    expect(summary.recent).toHaveLength(3);
  });

  it('returns zero counts for empty entries', () => {
    const summary = buildSummary([]);
    expect(summary.totalRuns).toBe(0);
    expect(summary.perVerdict).toEqual({});
    expect(summary.perLevel).toEqual({});
    expect(summary.recent).toEqual([]);
  });
});

describe('measureRecord', () => {
  it('records an entry and returns no error', () => {
    const root = makeTmpDir();
    const entry = { task: 'test', type: 'feature', level: 2, verdict: 'PASS' as const, checks: [], drift: '' };
    measureRecord(entry, { root });
    const entries = readHistory({ root });
    expect(entries).toHaveLength(1);
  });
});

describe('measureHistory', () => {
  it('returns a summary from recorded entries', () => {
    const root = makeTmpDir();
    measureRecord({ task: 'a', type: 'feature', level: 2, verdict: 'PASS' as const, checks: [], drift: '' }, { root });
    measureRecord({ task: 'b', type: 'bugfix', level: 3, verdict: 'FAIL' as const, checks: [], drift: '' }, { root });
    const summary = measureHistory({ root });
    expect(summary.totalRuns).toBe(2);
    expect(summary.perVerdict).toEqual({ PASS: 1, FAIL: 1 });
  });
});
