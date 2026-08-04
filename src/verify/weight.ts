import path from 'node:path';
import { realFs, type FsLike } from '../assess/probe.js';
import type { OracleKind } from '../assess/types.js';

const KIND_WEIGHTS: Record<OracleKind, number> = {
  'test-runner': 3,
  'type-check': 2,
  lint: 1,
  ci: 0,
};

const TEST_TOKEN = /\b(test|it|expect|assert)\b/;

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|js|jsx|mjs|mts)$/;

const TEST_DIR_NAMES = new Set(['test', 'tests', '__tests__']);

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache']);

function isTestFile(name: string): boolean {
  return TEST_FILE_PATTERN.test(name);
}

function isTestDir(name: string): boolean {
  return TEST_DIR_NAMES.has(name);
}

function collectTestFiles(fsLike: FsLike, dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = fsLike.readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (isTestFile(entry)) {
      out.push(full);
      continue;
    }
    if (isTestDir(entry)) {
      collectTestFiles(fsLike, full, out);
      continue;
    }
    let children: string[];
    try {
      children = fsLike.readdirSync(full);
    } catch {
      continue;
    }
    if (children.length > 0) {
      collectTestFiles(fsLike, full, out);
    }
  }
}

export function isTestsWeak(target: string, fsLike: FsLike = realFs): boolean {
  const testFiles: string[] = [];
  collectTestFiles(fsLike, target, testFiles);
  if (testFiles.length === 0) return true;
  for (const file of testFiles) {
    const content = fsLike.readFileSync(file);
    if (TEST_TOKEN.test(content)) return false;
  }
  return true;
}

export function baseWeight(kind: OracleKind): number {
  return KIND_WEIGHTS[kind];
}

export function calibrateWeight(base: number, sensitivity: number, precision: number): number {
  return base * sensitivity * precision;
}