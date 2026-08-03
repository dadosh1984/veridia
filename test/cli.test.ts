import { describe, expect, it } from 'vitest';
import { runCli } from './helpers/run-cli.js';

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
});
