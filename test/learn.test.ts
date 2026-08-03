import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { learn } from '../src/measure/learn.js';
import { appendEntry } from '../src/measure/history.js';

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
