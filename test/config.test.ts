import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, DEFAULT_CONFIG } from '../src/config/config.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-config-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('loadConfig', () => {
  it('returns default config when no .veridia/config.json exists', () => {
    const target = makeTmpDir();
    const config = loadConfig(target);
    expect(config.classify.patterns.bugfix).toBeDefined();
    expect(config.probes['test-runner']).toBeDefined();
    expect(config.models.cheapest).toBeDefined();
    expect(config.workflows.bugfix).toBeDefined();
  });

  it('merges user config with defaults', () => {
    const target = makeTmpDir();
    const configDir = path.join(target, '.veridia');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({
      classify: { patterns: { security: ['\\bauth\\b', '\\bpermission\\b'] } },
    }), 'utf8');
    const config = loadConfig(target);
    expect(config.classify.patterns.security).toEqual(['\\bauth\\b', '\\bpermission\\b']);
    expect(config.classify.patterns.bugfix).toBeDefined();
  });

  it('returns default config on invalid JSON', () => {
    const target = makeTmpDir();
    const configDir = path.join(target, '.veridia');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'config.json'), 'invalid json', 'utf8');
    const config = loadConfig(target);
    expect(config.classify.patterns.bugfix).toBeDefined();
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has all required sections', () => {
    expect(DEFAULT_CONFIG.classify.patterns).toBeDefined();
    expect(DEFAULT_CONFIG.probes).toBeDefined();
    expect(DEFAULT_CONFIG.models).toBeDefined();
    expect(DEFAULT_CONFIG.workflows).toBeDefined();
  });

  it('has all 6 task types in workflows', () => {
    expect(DEFAULT_CONFIG.workflows.bugfix).toBeDefined();
    expect(DEFAULT_CONFIG.workflows.feature).toBeDefined();
    expect(DEFAULT_CONFIG.workflows.refactor).toBeDefined();
    expect(DEFAULT_CONFIG.workflows.doc).toBeDefined();
    expect(DEFAULT_CONFIG.workflows.explore).toBeDefined();
    expect(DEFAULT_CONFIG.workflows.open).toBeDefined();
  });
});
