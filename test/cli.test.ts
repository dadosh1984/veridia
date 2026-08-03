import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCli } from './helpers/run-cli.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-cli-'));
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

describe('veridia CLI', () => {
  it('prints usage for --help and exits 0', () => {
    const result = runCli('--help');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('veridia');
  });

  it('prints usage for -h and exits 0', () => {
    const result = runCli('-h');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('veridia');
  });

  it('prints usage with no arguments and exits 0', () => {
    const result = runCli();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('veridia');
  });

  it('prints version for `version` subcommand and exits 0', () => {
    const result = runCli('version');
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('prints version for -v and exits 0', () => {
    const result = runCli('-v');
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('treats an unknown subcommand as a task string and runs triage', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{}');
    const result = runCli('frobnicate', '--target', dir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('type');
  });

  it('rejects an unknown flag with non-zero exit and error on stderr', () => {
    const result = runCli('--bogus');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('--bogus');
  });

  it('classifies a bug fix task and exits 0', () => {
    const result = runCli('classify', 'fix the null pointer in login');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('bugfix');
  });

  it('classifies a feature task and exits 0', () => {
    const result = runCli('classify', 'add dark mode support');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('feature');
  });

  it('rejects classify with no task string via non-zero exit and stderr', () => {
    const result = runCli('classify');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('task');
  });

  it('assesses the current working directory and exits 0', () => {
    const result = runCli('assess');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/^[0-3]\t/);
  });

  it('assesses a target path via --target and prints level and oracles', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'tsconfig.json', '{}');
    const result = runCli('assess', '--target', dir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('2\ttype-check');
  });

  it('rejects a missing target path with non-zero exit and stderr', () => {
    const dir = path.join(os.tmpdir(), 'veridia-missing-' + Date.now());
    const result = runCli('assess', '--target', dir);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(dir);
  });

  it('documents the assess subcommand in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('assess');
  });

  it('routes a feature at level 2 and prints a plan with exit 0', () => {
    const result = runCli('route', '--type', 'feature', '--level', '2');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('tdd-where-possible');
    expect(result.stdout).toContain('mid');
  });

  it('routes a bugfix at level 3 with full-tdd depth', () => {
    const result = runCli('route', '--type', 'bugfix', '--level', '3');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('full-tdd');
    expect(result.stdout).toContain('cheapest');
  });

  it('rejects route with a missing level flag', () => {
    const result = runCli('route', '--type', 'feature');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('level');
  });

  it('rejects route with an invalid type value', () => {
    const result = runCli('route', '--type', 'bogus', '--level', '2');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('bogus');
  });

  it('rejects route with an invalid level value', () => {
    const result = runCli('route', '--type', 'feature', '--level', '9');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('9');
  });

  it('documents the route subcommand in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('route');
  });

  it('asks a feature at level 1 and prints question blocks with exit 0', () => {
    const result = runCli('ask', '--type', 'feature', '--level', '1');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('acceptance');
  });

  it('asks about expectation at level 0', () => {
    const result = runCli('ask', '--type', 'open', '--level', '0');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('expected-outcome');
  });

  it('declines questions at level 3 with exit 0', () => {
    const result = runCli('ask', '--type', 'bugfix', '--level', '3');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('no clarifying questions needed');
  });

  it('rejects ask with a missing type flag', () => {
    const result = runCli('ask', '--level', '1');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('type');
  });

  it('rejects ask with an invalid level value', () => {
    const result = runCli('ask', '--type', 'feature', '--level', '9');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('9');
  });

  it('documents the ask subcommand in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('ask');
  });

  it('verifies a target with a failing test script and prints a verdict with exit 0', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{"scripts":{"test":"node -e \\"process.exit(1)\\""}}');
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('test-runner');
    expect(result.stdout).toContain('verdict');
  });

  it('verifies a target with no oracles and reports a HUMAN verdict', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'README.md', '');
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('verdict');
    expect(result.stdout).toContain('HUMAN');
  });

  it('rejects verify with a missing type flag', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{}');
    const result = runCli('verify', '--target', dir, '--level', '2');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('type');
  });

  it('rejects verify with a missing target path', () => {
    const dir = path.join(os.tmpdir(), 'veridia-verify-missing-' + Date.now());
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '2');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(dir);
  });

  it('rejects verify with an invalid level value', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{}');
    const result = runCli('verify', '--target', dir, '--type', 'feature', '--level', '9');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('9');
  });

  it('documents the verify subcommand in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('verify');
  });

  it('measures --history with no data prints no history', () => {
    const result = runCli('measure', '--history');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('totalRuns');
    expect(result.stdout).toContain('0');
  });

  it('measures --record with JSON payload and then --history shows it', () => {
    const payload = JSON.stringify({ task: 'add auth', type: 'feature', level: 2, verdict: 'PASS', checks: [], drift: '' });
    const rec = runCli('measure', '--record', payload);
    expect(rec.exitCode).toBe(0);
    expect(rec.stdout).toContain('recorded');
    const hist = runCli('measure', '--history');
    expect(hist.exitCode).toBe(0);
    expect(hist.stdout).toContain('totalRuns');
    expect(hist.stdout).toContain('1');
  });

  it('rejects measure --record with missing required fields', () => {
    const result = runCli('measure', '--record', '{"task":"only-task"}');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('task, type, and verdict');
  });

  it('rejects measure with no --record or --history', () => {
    const result = runCli('measure');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('--record');
  });

  it('documents the measure subcommand in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('measure');
  });

  it('runs end-to-end triage on a task string and prints type, level, plan, verdict', () => {
    const dir = makeTmpDir();
    writeFile(dir, 'package.json', '{}');
    const result = runCli('add dark mode support', '--target', dir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('type');
    expect(result.stdout).toContain('level');
    expect(result.stdout).toContain('plan');
    expect(result.stdout).toContain('verdict');
  });

  it('rejects an unknown flag with non-zero exit and error on stderr', () => {
    const result = runCli('--bogus');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('--bogus');
  });

  it('documents the triage mode in usage output', () => {
    const result = runCli('--help');
    expect(result.stdout).toContain('triage');
  });
});
