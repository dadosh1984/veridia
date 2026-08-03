import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assess } from '../src/assess/assess.js';
import { mapLevel } from '../src/assess/map-level.js';
import { probeOracles, realFs } from '../src/assess/probe.js';
import type { FsLike, Oracle, OracleKind, VerifiabilityLevel } from '../src/assess/types.js';

const tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-assess-'));
  tmpDirs.push(dir);
  return dir;
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function fakeFs(target: string, files: Record<string, string>): FsLike {
  const norm = (p: string) => path.resolve(p).replace(/\\/g, '/');
  const store = new Map<string, string>();
  for (const [rel, content] of Object.entries(files)) {
    store.set(norm(path.join(target, rel)), content);
  }
  return {
    existsSync: (p) => {
      const n = norm(p);
      if (store.has(n)) return true;
      for (const key of store.keys()) {
        if (key.startsWith(n + '/')) return true;
      }
      return false;
    },
    readFileSync: (p) => store.get(norm(p)) ?? '',
    readdirSync: (p) => {
      const n = norm(p);
      const names = new Set<string>();
      for (const key of store.keys()) {
        if (key.startsWith(n + '/')) {
          names.add(key.slice(n.length + 1).split('/')[0]);
        }
      }
      return [...names];
    },
  };
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('probeOracles', () => {
  it('detects a test runner from a vitest config file', () => {
    const target = makeTmpDir();
    const found = probeOracles(target, fakeFs(target, { 'vitest.config.ts': '' }));
    expect(found).toContainEqual<Oracle>({ kind: 'test-runner' });
  });

  it('detects a test runner from a package.json test script', () => {
    const target = makeTmpDir();
    const found = probeOracles(
      target,
      fakeFs(target, { 'package.json': '{"scripts":{"test":"vitest run"}}' }),
    );
    expect(found).toContainEqual<Oracle>({ kind: 'test-runner' });
  });

  it('detects a type-check oracle from tsconfig.json', () => {
    const target = makeTmpDir();
    const found = probeOracles(target, fakeFs(target, { 'tsconfig.json': '{}' }));
    expect(found).toContainEqual<Oracle>({ kind: 'type-check' });
  });

  it('detects a lint oracle from an eslint config', () => {
    const target = makeTmpDir();
    const found = probeOracles(target, fakeFs(target, { 'eslint.config.js': '' }));
    expect(found).toContainEqual<Oracle>({ kind: 'lint' });
  });

  it('detects a ci oracle from a github workflow yaml', () => {
    const target = makeTmpDir();
    const found = probeOracles(
      target,
      fakeFs(target, { '.github/workflows/ci.yml': 'name: ci' }),
    );
    expect(found).toContainEqual<Oracle>({ kind: 'ci' });
  });

  it('returns an empty oracle list when nothing is detected', () => {
    const target = makeTmpDir();
    const found = probeOracles(target, fakeFs(target, { 'README.md': '' }));
    expect(found).toEqual<Oracle[]>([]);
  });

  it('never probes into node_modules', () => {
    const target = makeTmpDir();
    const found = probeOracles(
      target,
      fakeFs(target, { 'node_modules/vitest.config.ts': '', 'node_modules/tsconfig.json': '' }),
    );
    expect(found).toEqual<Oracle[]>([]);
  });

  it('is deterministic: same fs yields same oracle list', () => {
    const target = makeTmpDir();
    const fsLike = fakeFs(target, { 'tsconfig.json': '{}' });
    expect(probeOracles(target, fsLike)).toEqual(probeOracles(target, fsLike));
  });
});

describe('mapLevel', () => {
  const oracle = (kind: OracleKind): Oracle => ({ kind });

  it('returns 1 (human) when no oracles exist', () => {
    expect(mapLevel([])).toBe<VerifiabilityLevel>(1);
  });

  it('returns at least 2 (partial) when a type-check oracle exists', () => {
    expect(mapLevel([oracle('type-check')])).toBe<VerifiabilityLevel>(2);
  });

  it('returns 3 (full) for tests with a deterministic default', () => {
    expect(mapLevel([oracle('test-runner')])).toBe<VerifiabilityLevel>(3);
  });

  it('stays below 3 for tests when the task hint is exploratory', () => {
    const level = mapLevel([oracle('test-runner')], 'explore');
    expect(level).toBeLessThan(3);
  });

  it('treats open as non-deterministic', () => {
    const level = mapLevel([oracle('test-runner')], 'open');
    expect(level).toBeLessThan(3);
  });

  it('returns 2 for a lint-only oracle', () => {
    expect(mapLevel([oracle('lint')])).toBe<VerifiabilityLevel>(2);
  });
});

describe('assess', () => {
  it('returns level >= 2 and a type-check oracle for a tsconfig-only target', () => {
    const target = makeTmpDir();
    writeFile(target, 'tsconfig.json', '{}');
    const result = assess(target, realFs);
    expect(result.level).toBeGreaterThanOrEqual(2);
    expect(result.oracles).toContainEqual<Oracle>({ kind: 'type-check' });
  });

  it('returns level 1 and an empty oracle list for a bare target', () => {
    const target = makeTmpDir();
    writeFile(target, 'README.md', '');
    const result = assess(target, realFs);
    expect(result.level).toBe<VerifiabilityLevel>(1);
    expect(result.oracles).toEqual<Oracle[]>([]);
  });

  it('is deterministic: same target yields same assessment', () => {
    const target = makeTmpDir();
    writeFile(target, 'tsconfig.json', '{}');
    expect(assess(target, realFs)).toEqual(assess(target, realFs));
  });
});
