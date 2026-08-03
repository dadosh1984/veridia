import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildReviewInstructions } from '../src/review/review.js';
import { buildAgentInstruction, formatAgentInstructionJson } from '../src/util/agent-instruction.js';
import { getAgent } from '../src/agent/agents.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-review-'));
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

describe('buildReviewInstructions', () => {
  it('returns instruction with files and patterns', () => {
    const target = makeTmpDir();
    writeFile(target, 'src/index.ts', 'const x = 1;\n');
    writeFile(target, 'src/utils.ts', 'export function foo() { return 1; }\n');
    const result = buildReviewInstructions(target);
    expect(result.instruction).toBeTruthy();
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.patterns).toContain('hardcoded secrets or credentials');
    expect(result.outputFormat).toBeTruthy();
  });

  it('returns empty files for empty target', () => {
    const target = makeTmpDir();
    const result = buildReviewInstructions(target);
    expect(result.files).toEqual([]);
  });

  it('skips node_modules and dist directories', () => {
    const target = makeTmpDir();
    writeFile(target, 'node_modules/foo/index.js', 'const x = 1;\n');
    writeFile(target, 'dist/bundle.js', 'const y = 2;\n');
    writeFile(target, 'src/index.ts', 'const z = 3;\n');
    const result = buildReviewInstructions(target);
    expect(result.files.length).toBe(1);
    expect(result.files[0].path.replace(/\\/g, '/')).toBe('src/index.ts');
  });
});

describe('buildAgentInstruction', () => {
  it('returns valid instruction JSON', () => {
    const ai = buildAgentInstruction('test instruction', { key: 'value' }, 'expected output');
    const json = formatAgentInstructionJson(ai);
    const parsed = JSON.parse(json);
    expect(parsed.instruction).toBe('test instruction');
    expect(parsed.context.key).toBe('value');
    expect(parsed.expectedOutput).toBe('expected output');
    expect(parsed.agent).toBeNull();
  });

  it('includes agent info when provided', () => {
    const agent = getAgent('claude')!;
    const ai = buildAgentInstruction('test', {}, 'output', agent);
    const json = formatAgentInstructionJson(ai);
    const parsed = JSON.parse(json);
    expect(parsed.agent.id).toBe('claude');
    expect(parsed.agent.name).toBe('Claude Code');
  });
});
