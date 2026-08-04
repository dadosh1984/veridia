import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildAgentChoices } from '../src/cli/commands/init.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-init-'));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('buildAgentChoices', () => {
  it('pre-selects agents whose config directory exists in the target', () => {
    const target = makeTmpDir();
    fs.mkdirSync(path.join(target, '.opencode'), { recursive: true });
    const choices = buildAgentChoices(target);
    const opencode = choices.find((c) => c.value === 'opencode');
    const claude = choices.find((c) => c.value === 'claude');
    expect(opencode?.selected).toBe(true);
    expect(claude?.selected).toBe(false);
    expect(choices.length).toBeGreaterThan(20);
  });
});
