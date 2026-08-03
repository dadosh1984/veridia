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

  it('rejects an unknown subcommand with non-zero exit and error on stderr', () => {
    const result = runCli('frobnicate');
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain('frobnicate');
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
});
