import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Session } from '../src/session/types.js';
import { readSession, writeSession, clearSession } from '../src/session/session.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-session-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('Session', () => {
  it('has all required fields', () => {
    const session: Session = {
      task: 'add auth',
      type: 'feature',
      confidence: 0.85,
      level: 2,
      plan: { depth: 'tdd-where-possible', tier: 'mid', steps: [], checks: [] },
      answers: { framework: 'express' },
      verdict: 'PASS',
      step: 'done',
    };
    expect(session.task).toBe('add auth');
    expect(session.step).toBe('done');
  });
});

describe('readSession', () => {
  it('returns null when no file exists', () => {
    const dir = makeTmpDir();
    expect(readSession(dir)).toBeNull();
  });
});

describe('writeSession', () => {
  it('creates session.json file', () => {
    const dir = makeTmpDir();
    const session: Session = { task: 'test', step: 'classify' };
    writeSession(session, dir);
    const file = path.join(dir, '.veridia', 'session.json');
    expect(fs.existsSync(file)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Session;
    expect(parsed.task).toBe('test');
    expect(parsed.step).toBe('classify');
  });
});

describe('clearSession', () => {
  it('deletes session.json', () => {
    const dir = makeTmpDir();
    const session: Session = { task: 'test', step: 'classify' };
    writeSession(session, dir);
    clearSession(dir);
    expect(readSession(dir)).toBeNull();
  });
});
