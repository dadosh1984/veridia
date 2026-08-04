import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AgentInfo } from '../src/agent/types.js';
import { installSkills } from '../src/generate/skills.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-skills-'));
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

describe('installSkills', () => {
  it('copies bundled veridia skills into the agent configDir/skills', () => {
    const source = makeTmpDir();
    writeFile(source, 'skills/veridia-one/SKILL.md', '---\nname: veridia-one\ndescription: one\n---\nbody');
    writeFile(source, 'skills/veridia-two/SKILL.md', '---\nname: veridia-two\ndescription: two\n---\nbody');
    const target = makeTmpDir();
    const agent = { configDir: '.opencode' } as AgentInfo;

    const installed = installSkills(agent, target, path.join(source, 'skills'));
    expect(installed).toHaveLength(2);

    expect(fs.existsSync(path.join(target, '.opencode', 'skills', 'veridia-one', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(target, '.opencode', 'skills', 'veridia-two', 'SKILL.md'))).toBe(true);
  });

  it('copies nothing when the source has no veridia skills', () => {
    const source = makeTmpDir();
    writeFile(source, 'skills/other/X.md', 'x');
    const target = makeTmpDir();
    const agent = { configDir: '.opencode' } as AgentInfo;

    const installed = installSkills(agent, target, path.join(source, 'skills'));
    expect(installed).toEqual([]);
    expect(fs.existsSync(path.join(target, '.opencode', 'skills'))).toBe(false);
  });
});
