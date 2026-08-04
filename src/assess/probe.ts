import fs from 'node:fs';
import path from 'node:path';
import { stripBom } from '../util/strip-bom.js';
import { hasMeaningfulTests } from '../util/test-files.js';
import type { Oracle, OracleKind } from './types.js';
import type { VeridiaConfig } from '../config/config.js';

export interface FsLike {
  existsSync(p: string): boolean;
  readFileSync(p: string): string;
  readdirSync(p: string): string[];
}

const MAX_CONFIG_BYTES = 64 * 1024;

export const realFs: FsLike = {
  existsSync: (p) => fs.existsSync(p),
  readFileSync: (p) => {
    try {
      const buf = fs.readFileSync(p);
      return buf.subarray(0, MAX_CONFIG_BYTES).toString('utf8');
    } catch {
      return '';
    }
  },
  readdirSync: (p) => {
    try {
      return fs.readdirSync(p);
    } catch {
      return [];
    }
  },
};

interface ProbeSpec {
  kind: OracleKind;
  files: string[];
  scripts?: string[];
  dirs?: string[];
  dirExts?: string[];
}

const DEFAULT_PROBES: ProbeSpec[] = [
  { kind: 'test-runner', files: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mts', 'vitest.config.mjs', 'jest.config.ts', 'jest.config.js', 'jest.config.mjs', 'playwright.config.ts', '.mocharc.json', 'karma.conf.js'], scripts: ['test'] },
  { kind: 'type-check', files: ['tsconfig.json'], scripts: ['typecheck', 'type-check'] },
  { kind: 'lint', files: ['eslint.config.js', 'eslint.config.ts', 'eslint.config.mjs', '.eslintrc', '.eslintrc.json', '.eslintrc.js'], scripts: ['lint'] },
  { kind: 'ci', files: ['.gitlab-ci.yml', '.circleci/config.yml', 'azure-pipelines.yml'], dirs: ['.github/workflows'], dirExts: ['.yml', '.yaml'] },
];

function buildProbesFromConfig(config: VeridiaConfig): ProbeSpec[] {
  const probes: ProbeSpec[] = [];
  for (const [kind, cfg] of Object.entries(config.probes)) {
    const c = cfg as ProbeSpec;
    probes.push({
      kind: kind as OracleKind,
      files: c.files ?? [],
      scripts: c.scripts,
      dirs: c.dirs,
      dirExts: c.dirExts,
    });
  }
  return probes;
}

function hasScript(fsLike: FsLike, target: string, script: string): boolean {
  const raw = fsLike.readFileSync(path.join(target, 'package.json'));
  try {
    const pkg = JSON.parse(stripBom(raw));
    const scripts = (pkg.scripts ?? {}) as Record<string, unknown>;
    return script in scripts;
  } catch {
    return false;
  }
}

function detect(fsLike: FsLike, target: string, spec: ProbeSpec): boolean {
  for (const file of spec.files) {
    if (fsLike.existsSync(path.join(target, file))) return true;
  }
  for (const dir of spec.dirs ?? []) {
    const entries = fsLike.readdirSync(path.join(target, dir));
    for (const entry of entries) {
      if ((spec.dirExts ?? []).some((ext) => entry.endsWith(ext))) return true;
    }
  }
  for (const script of spec.scripts ?? []) {
    if (hasScript(fsLike, target, script)) return true;
  }
  return false;
}

export function probeOracles(target: string, fsLike: FsLike, config?: VeridiaConfig): Oracle[] {
  const probes = config ? buildProbesFromConfig(config) : DEFAULT_PROBES;
  const oracles: Oracle[] = [];
  for (const spec of probes) {
    if (detect(fsLike, target, spec)) oracles.push({ kind: spec.kind });
  }
  if (oracles.some((o) => o.kind === 'test-runner')) {
    const strong = hasMeaningfulTests(fsLike, target);
    oracles.push({ kind: 'test-content', present: strong });
  }
  return oracles;
}
