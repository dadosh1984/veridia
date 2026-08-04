import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, getModelConfig, DEFAULT_CONFIG } from '../src/config/config.js';

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
  });

  it('has classify patterns for bugfix, feature, doc, refactor, explore', () => {
    expect(DEFAULT_CONFIG.classify.patterns.bugfix).toBeDefined();
    expect(DEFAULT_CONFIG.classify.patterns.feature).toBeDefined();
    expect(DEFAULT_CONFIG.classify.patterns.refactor).toBeDefined();
    expect(DEFAULT_CONFIG.classify.patterns.doc).toBeDefined();
    expect(DEFAULT_CONFIG.classify.patterns.explore).toBeDefined();
  });
});

describe('getModelConfig', () => {
  it('returns undefined when no model config', () => {
    expect(getModelConfig(DEFAULT_CONFIG)).toBeUndefined();
  });

  it('reads model settings from config', () => {
    const config = { ...DEFAULT_CONFIG, model: { provider: 'stdio' as const, model: 'llama' } };
    const mc = getModelConfig(config);
    expect(mc).toBeDefined();
    expect(mc!.provider).toBe('stdio');
    expect(mc!.model).toBe('llama');
  });

  it('reads api key from env when not in config', () => {
    const old = process.env.VERIDIA_API_KEY;
    process.env.VERIDIA_API_KEY = 'sk-test';
    try {
      const config = { ...DEFAULT_CONFIG, model: { provider: 'api' as const, model: 'gpt-4', apiUrl: 'https://api.openai.com/v1/chat/completions' } };
      const mc = getModelConfig(config);
      expect(mc!.apiKey).toBe('sk-test');
    } finally {
      process.env.VERIDIA_API_KEY = old;
    }
  });
});
