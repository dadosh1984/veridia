import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAgent } from '../src/agent/agents.js';
import { getCommandFiles } from '../src/generate/adapters.js';
import { generateCommands } from '../src/generate/generate.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-generate-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('getCommandFiles', () => {
  it('generates command files for claude (namespaced)', () => {
    const agent = getAgent('claude')!;
    const files = getCommandFiles(agent);
    expect(files.length).toBeGreaterThan(0);
    const classifyFile = files.find((f) => f.path.includes('classify'));
    expect(classifyFile).toBeDefined();
    expect(classifyFile!.path).toContain('.claude/commands/veridia/');
    expect(classifyFile!.content).toContain('veridia classify');
  });

  it('generates command files for opencode (flat)', () => {
    const agent = getAgent('opencode')!;
    const files = getCommandFiles(agent);
    const classifyFile = files.find((f) => f.path.includes('classify'));
    expect(classifyFile).toBeDefined();
    expect(classifyFile!.path).toContain('.opencode/commands/veridia-classify');
  });

  it('generates all 11 commands', () => {
    const agent = getAgent('cursor')!;
    const files = getCommandFiles(agent);
    expect(files).toHaveLength(11);
  });
});

describe('generateCommands', () => {
  it('writes command files to the target directory', () => {
    const target = makeTmpDir();
    const agent = getAgent('claude')!;
    const generated = generateCommands(agent, target);
    expect(generated.length).toBe(11);
    for (const filePath of generated) {
      const full = path.join(target, filePath);
      expect(fs.existsSync(full)).toBe(true);
    }
  });

  it('creates nested directories', () => {
    const target = makeTmpDir();
    const agent = getAgent('claude')!;
    generateCommands(agent, target);
    expect(fs.existsSync(path.join(target, '.claude', 'commands', 'veridia'))).toBe(true);
  });
});
