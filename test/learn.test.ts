import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { learn, computePrecision } from '../src/measure/learn.js';
import { appendEntry } from '../src/measure/history.js';
import type { MeasureEntry } from '../src/measure/types.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-learn-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('learn', () => {
  it('returns empty result when no history exists', () => {
    const dir = makeTmpDir();
    const result = learn({ root: dir });
    expect(result.totalRuns).toBe(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('computes classification accuracy from history', () => {
    const dir = makeTmpDir();
    appendEntry({ task: 'fix bug', type: 'bugfix', level: 3, verdict: 'PASS', checks: [], drift: '0' }, { root: dir });
    appendEntry({ task: 'fix crash', type: 'bugfix', level: 3, verdict: 'FAIL', checks: [], drift: '0' }, { root: dir });
    appendEntry({ task: 'add feature', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '0' }, { root: dir });
    const result = learn({ root: dir });
    expect(result.totalRuns).toBe(3);
    expect(result.classificationAccuracy.bugfix).toBe(0.5);
    expect(result.classificationAccuracy.feature).toBe(1);
  });

  it('detects drift patterns', () => {
    const dir = makeTmpDir();
    appendEntry({ task: 'fix bug', type: 'bugfix', level: 3, verdict: 'FAIL', checks: [], drift: '1' }, { root: dir });
    const result = learn({ root: dir });
    expect(result.driftPatterns.length).toBeGreaterThan(0);
  });
});

describe('computePrecision', () => {
  it('returns 1.0 for perfect oracle', () => {
    const entries: MeasureEntry[] = [{
      task: 'a', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '0', timestamp: '',
      oracleResults: [{ kind: 'test-runner', truePositives: 10, falsePositives: 0 }],
    }];
    expect(computePrecision(entries)['test-runner']).toBe(1.0);
  });

  it('returns 0.2 for unreliable oracle', () => {
    const entries: MeasureEntry[] = [{
      task: 'a', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '0', timestamp: '',
      oracleResults: [{ kind: 'test-runner', truePositives: 2, falsePositives: 8 }],
    }];
    expect(computePrecision(entries)['test-runner']).toBe(0.2);
  });

  it('aggregates across multiple entries', () => {
    const entries: MeasureEntry[] = [
      { task: 'a', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '0', timestamp: '',
        oracleResults: [{ kind: 'test-runner', truePositives: 5, falsePositives: 1 }] },
      { task: 'b', type: 'bugfix', level: 3, verdict: 'FAIL', checks: [], drift: '0', timestamp: '',
        oracleResults: [{ kind: 'test-runner', truePositives: 3, falsePositives: 1 }] },
    ];
    const prec = computePrecision(entries)['test-runner'];
    expect(prec).toBeCloseTo(0.8, 1);
  });

  it('returns empty object when no oracleResults exist', () => {
    const entries: MeasureEntry[] = [{
      task: 'a', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '0', timestamp: '',
    }];
    expect(computePrecision(entries)).toEqual({});
  });
});
