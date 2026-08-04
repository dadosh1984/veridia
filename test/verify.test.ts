import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { OracleKind } from '../src/assess/types.js';
import { resolveCommands } from '../src/verify/resolve.js';
import type { Check, Verdict, VerifyResult } from '../src/verify/types.js';
import { deriveVerdict, verify } from '../src/verify/verify.js';
import { runCommand } from '../src/verify/run.js';
import { baseWeight, isTestsWeak, calibrateWeight } from '../src/verify/weight.js';
import { mutate, computeSensitivity } from '../src/verify/mutate.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-verify-'));
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

const exitZero = (): { exitCode: number } => ({ exitCode: 0 });
const exitOne = (): { exitCode: number } => ({ exitCode: 1 });

function check(kind: OracleKind, passed: boolean, weak = false): Check {
  return { kind, command: `${kind}-cmd`, weight: baseWeight(kind), weak, passed };
}

describe('mutate', () => {
  it('mutates boolean true to false', () => {
    const result = mutate('const x = true;');
    expect(result.some((m) => m.includes('false'))).toBe(true);
  });

  it('mutates === to !==', () => {
    const result = mutate('if (a === b) {');
    expect(result.some((m) => m.includes('!=='))).toBe(true);
  });

  it('produces at least 3 mutations', () => {
    const result = mutate('const x = true; if (a === b) { return 1; }');
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it('returns empty array for empty input', () => {
    expect(mutate('')).toEqual([]);
  });
});

describe('computeSensitivity', () => {
  it('returns 1.0 when oracle catches all mutations', () => {
    const oracle = (): number => 1;
    const sensitivity = computeSensitivity('const x = true;', oracle);
    expect(sensitivity).toBe(1.0);
  });

  it('returns 0.0 when oracle catches no mutations', () => {
    const oracle = (): number => 0;
    const sensitivity = computeSensitivity('const x = true;', oracle);
    expect(sensitivity).toBe(0.0);
  });

  it('returns 0.5 when oracle catches half the mutations', () => {
    let callCount = 0;
    const oracle = (): number => {
      callCount++;
      return callCount % 2 === 0 ? 1 : 0;
    };
    const sensitivity = computeSensitivity('const x = true; if (a === b) { return 1; }', oracle);
    expect(sensitivity).toBeCloseTo(0.5, 1);
  });
});

describe('calibrateWeight', () => {
  it('multiplies base weight by sensitivity and precision', () => {
    expect(calibrateWeight(3, 1.0, 1.0)).toBe(3);
    expect(calibrateWeight(3, 0.5, 1.0)).toBe(1.5);
    expect(calibrateWeight(3, 1.0, 0.5)).toBe(1.5);
    expect(calibrateWeight(3, 0.0, 1.0)).toBe(0);
  });
});

describe('resolveCommands', () => {
  it('yields the package.json test script for a test-runner', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    const resolved = resolveCommands(['test-runner'], target);
    expect(resolved).toEqual([{ kind: 'test-runner', command: 'vitest run' }]);
  });

  it('yields the package.json test script for a test-runner with a leading BOM', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '\uFEFF{"scripts":{"test":"vitest run"}}');
    const resolved = resolveCommands(['test-runner'], target);
    expect(resolved).toEqual([{ kind: 'test-runner', command: 'vitest run' }]);
  });

  it('resolves the same command with and without a BOM', () => {
    const a = makeTmpDir();
    const b = makeTmpDir();
    writeFile(a, 'package.json', '{"scripts":{"lint":"eslint src"}}');
    writeFile(b, 'package.json', '\uFEFF{"scripts":{"lint":"eslint src"}}');
    expect(resolveCommands(['lint'], a)).toEqual(resolveCommands(['lint'], b));
  });

  it('falls back to tsc --noEmit for a type-check with no script', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"build":"tsc"}}');
    const resolved = resolveCommands(['type-check'], target);
    expect(resolved).toEqual([{ kind: 'type-check', command: 'tsc --noEmit' }]);
  });

  it('prefers the typecheck script when present', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"typecheck":"tsc --noEmit --strict"}}');
    const resolved = resolveCommands(['type-check'], target);
    expect(resolved).toEqual([{ kind: 'type-check', command: 'tsc --noEmit --strict' }]);
  });

  it('falls back to eslint . for a lint with no script', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const resolved = resolveCommands(['lint'], target);
    expect(resolved).toEqual([{ kind: 'lint', command: 'eslint .' }]);
  });

  it('skips ci oracles (not runnable locally)', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const resolved = resolveCommands(['ci'], target);
    expect(resolved).toEqual([]);
  });

  it('returns an empty list for no oracles', () => {
    const target = makeTmpDir();
    expect(resolveCommands([], target)).toEqual([]);
  });
});

describe('baseWeight', () => {
  it('orders test-runner above type-check above lint', () => {
    expect(baseWeight('test-runner')).toBeGreaterThan(baseWeight('type-check'));
    expect(baseWeight('type-check')).toBeGreaterThan(baseWeight('lint'));
  });

  it('gives ci weight zero', () => {
    expect(baseWeight('ci')).toBe(0);
  });
});

describe('isTestsWeak', () => {
  it('flags a test-runner weak when test files have no test tokens', () => {
    const target = makeTmpDir();
    writeFile(target, 'test/foo.test.js', '// placeholder\nconst value = 1;\n');
    expect(isTestsWeak(target)).toBe(true);
  });

  it('does not flag weak when test files contain expectations', () => {
    const target = makeTmpDir();
    writeFile(target, 'test/foo.test.js', 'import { expect } from "vitest";\nexpect(1).toBe(1);\n');
    expect(isTestsWeak(target)).toBe(false);
  });

  it('flags weak when no test files exist at all', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    expect(isTestsWeak(target)).toBe(true);
  });
});

describe('deriveVerdict', () => {
  it('returns PASS at level 3 when all strong checks pass', () => {
    const checks = [check('test-runner', true), check('type-check', true)];
    expect(deriveVerdict(3, checks)).toBe<Verdict>('PASS');
  });

  it('returns FAIL at level 3 when a strong check fails', () => {
    const checks = [check('test-runner', false)];
    expect(deriveVerdict(3, checks)).toBe<Verdict>('FAIL');
  });

  it('ignores weak checks at level 3', () => {
    const checks = [check('test-runner', false, true), check('type-check', true)];
    expect(deriveVerdict(3, checks)).toBe<Verdict>('PASS');
  });

  it('returns HUMAN at level 3 when no strong checks exist', () => {
    const checks = [check('test-runner', true, true)];
    expect(deriveVerdict(3, checks)).toBe<Verdict>('HUMAN');
  });

  it('returns HUMAN at level 2 when no strong checks exist', () => {
    const checks = [check('test-runner', true, true)];
    expect(deriveVerdict(2, checks)).toBe<Verdict>('HUMAN');
  });

  it('returns PASS at level 2 when all checks pass', () => {
    const checks = [check('test-runner', true), check('type-check', true)];
    expect(deriveVerdict(2, checks)).toBe<Verdict>('PASS');
  });

  it('returns FAIL at level 2 when any check fails', () => {
    const checks = [check('test-runner', true), check('type-check', false)];
    expect(deriveVerdict(2, checks)).toBe<Verdict>('FAIL');
  });

  it('returns HUMAN at level 1 always', () => {
    expect(deriveVerdict(1, [check('test-runner', false)])).toBe<Verdict>('HUMAN');
  });

  it('returns HUMAN at level 0 always', () => {
    expect(deriveVerdict(0, [check('test-runner', false)])).toBe<Verdict>('HUMAN');
  });

  it('returns HUMAN for an empty check list', () => {
    expect(deriveVerdict(3, [])).toBe<Verdict>('HUMAN');
  });
});

describe('runCommand', () => {
  it('returns stderr text when a command fails', () => {
    const result = runCommand(process.cwd(), `"${process.execPath}" -e "process.stderr.write('boom'); process.exit(1)"`);
    expect(result.exitCode).toBe(1);
    expect(result.error).toMatch(/boom/);
  });

  it('returns an error when the command cannot be spawned', () => {
    const result = runCommand(process.cwd(), 'veridia-no-such-binary-xyzabc');
    expect(result.exitCode).not.toBe(0);
    expect(result.error).toBeTruthy();
  });
});

describe('verify', () => {
  it('runs resolved commands and reports passed checks with a PASS verdict', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    writeFile(target, 'test/foo.test.js', 'import { expect } from "vitest";\nexpect(1).toBe(1);\n');
    const result = verify(target, 3, ['test-runner'], { run: exitZero });
    expect(result.checks).toHaveLength(1);
    expect(result.checks[0]).toMatchObject({ kind: 'test-runner', passed: true, weak: false });
    expect(result.verdict).toBe<Verdict>('PASS');
  });

  it('reports a failed check when the injected run exits non-zero', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    const result = verify(target, 2, ['test-runner'], { run: exitOne });
    expect(result.checks[0].passed).toBe(false);
    expect(result.verdict).toBe<Verdict>('HUMAN');
  });

  it('carries optional error text on a Check', () => {
    const c: Check = { kind: 'lint', command: 'eslint .', weight: 1, weak: false, passed: false, error: 'oops' };
    expect(c.error).toBe('oops');
  });

  it('reports why a check failed', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const result = verify(target, 2, ['type-check'], { run: () => ({ exitCode: 1, error: 'tsc: boom' }) });
    expect(result.checks[0].error).toMatch(/boom/);
    expect(result.verdict).toBe<Verdict>('FAIL');
  });

  it('returns a HUMAN verdict when no oracles are detected', () => {
    const target = makeTmpDir();
    const result = verify(target, 3, [], { run: exitZero });
    expect(result.checks).toEqual([]);
    expect(result.verdict).toBe<Verdict>('HUMAN');
  });

  it('returns matching checks and verdict', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{}');
    const result = verify(target, 3, ['type-check', 'lint'], { run: exitZero });
    expect(result.checks).toHaveLength(2);
    expect(result.checks.map((c) => c.kind)).toEqual<OracleKind[]>(['type-check', 'lint']);
    expect(result.verdict).toBe<Verdict>('PASS');
  });

  it('is deterministic: repeated runs agree', () => {
    const target = makeTmpDir();
    writeFile(target, 'package.json', '{"scripts":{"test":"vitest run"}}');
    const first: VerifyResult = verify(target, 3, ['test-runner'], { run: exitZero });
    const second: VerifyResult = verify(target, 3, ['test-runner'], { run: exitZero });
    expect(second).toEqual(first);
  });
});
