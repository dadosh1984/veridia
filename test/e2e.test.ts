import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCli } from './helpers/run-cli.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-e2e-'));
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

describe('e2e: classify', () => {
  it('classifies a bugfix task and returns valid JSON', () => {
    const result = runCli('classify', 'fix the null pointer in login');
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { type: string; confidence: number };
    expect(parsed.type).toBe('bugfix');
    expect(parsed.confidence).toBeGreaterThan(0);
  });

  it('classifies a feature task and returns valid JSON', () => {
    const result = runCli('classify', 'add dark mode support');
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { type: string };
    expect(parsed.type).toBe('feature');
  });
});

describe('e2e: assess', () => {
  it('assesses a bare directory and returns level 1', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'README.md', '');
    const result = runCli('assess', '--target', dir);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { level: number; oracles: string[] };
    expect(parsed.level).toBe(1);
    expect(parsed.oracles).toEqual([]);
  });

  it('assesses a tsconfig directory and returns level 2', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'tsconfig.json', '{}');
    const result = runCli('assess', '--target', dir);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { level: number };
    expect(parsed.level).toBe(2);
  });
});

describe('e2e: triage', () => {
  it('runs full triage loop and returns valid JSON with all fields', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{}');
    const result = runCli('add dark mode support', '--target', dir);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      type: string;
      level: number;
      plan: unknown;
      verdict: string;
      executionPlan: unknown;
      executionResult: unknown;
    };
    expect(parsed.type).toBe('feature');
    expect(typeof parsed.level).toBe('number');
    expect(parsed.plan).toBeTruthy();
    expect(parsed.verdict).toBeTruthy();
    expect(parsed.executionPlan).toBeTruthy();
    expect(parsed.executionResult).toBeTruthy();
  });
});
