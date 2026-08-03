import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { triage } from '../src/triage/triage.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-triage-'));
  tmpDirs.push(dir);
  return dir;
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('triage', () => {
  it('runs the full loop and returns a result with type, level, plan, and verdict', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    writeFile(target, 'tsconfig.json', '{}');
    const result = triage('add dark mode support', target);
    expect(result.task).toBe('add dark mode support');
    expect(result.type).toBe('feature');
    expect(result.confidence).toBeGreaterThan(0);
    expect([0, 1, 2, 3]).toContain(result.level);
    expect(result.plan.depth).toBeTruthy();
    expect(result.verdict).toBeTruthy();
  });

  it('classifies a bugfix task correctly', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const result = triage('fix the null pointer crash', target);
    expect(result.type).toBe('bugfix');
  });

  it('records outcome via measure', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    triage('add feature', target);
    const historyFile = path.join(target, '.veridia', 'history.jsonl');
    expect(fs.existsSync(historyFile)).toBe(true);
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(1);
    const entry = JSON.parse(lines[0]);
    expect(entry.task).toBe('add feature');
    expect(entry.type).toBe('feature');
  });

  it('is deterministic for the same task and target', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const first = triage('refactor the module', target);
    const second = triage('refactor the module', target);
    expect(first.type).toBe(second.type);
    expect(first.level).toBe(second.level);
    expect(first.verdict).toBe(second.verdict);
  });

  it('includes execution plan and result in output', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const result = triage('add feature', target);
    expect(result.executionPlan).toBeDefined();
    expect(result.executionPlan!.task).toBe('add feature');
    expect(result.executionResult).toBeDefined();
    expect(result.executionResult!.exitCode).toBe(0);
  });
});
