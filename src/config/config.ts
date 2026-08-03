import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface VeridiaConfig {
  classify: {
    patterns: Record<string, string[]>;
  };
  probes: {
    'test-runner': { files: string[]; scripts: string[] };
    'type-check': { files: string[]; scripts: string[] };
    lint: { files: string[]; scripts: string[] };
    ci: { files: string[]; dirs: string[] };
  };
}

export const DEFAULT_CONFIG: VeridiaConfig = {
  classify: {
    patterns: {
      bugfix: ['\\bfix\\b', '\\bbug\\b', '\\bcrash\\b', '\\bnull pointer\\b', '\\berror\\b', '\\bbroken\\b', '\\bpatch\\b'],
      feature: ['\\badd\\b', '\\bimplement\\b', '\\bsupport\\b', '\\bnew\\b', '\\bfeature\\b', '\\bintroduce\\b', '\\benable\\b'],
      doc: ['\\bdoc\\b', '\\bdocument\\b', '\\breadme\\b', '\\bcomment\\b', '\\bwrite.*guide\\b'],
      refactor: ['\\brefactor\\b', '\\brestructure\\b', '\\bclean ?up\\b', '\\bsimplify\\b', '\\bextract\\b', '\\brename\\b'],
      explore: ['\\bevaluate\\b', '\\bexplore\\b', '\\bresearch\\b', '\\bcompare\\b', '\\binvestigate\\b', '\\boptions?\\b'],
    },
  },
  probes: {
    'test-runner': {
      files: ['vitest.config.ts', 'vitest.config.js', 'jest.config.ts', 'jest.config.js', 'playwright.config.ts', '.mocharc.json', 'karma.conf.js'],
      scripts: ['test'],
    },
    'type-check': {
      files: ['tsconfig.json', 'jsconfig.json'],
      scripts: ['typecheck', 'type-check'],
    },
    lint: {
      files: ['eslint.config.js', 'eslint.config.ts', '.eslintrc', '.eslintrc.json', '.eslintrc.js'],
      scripts: ['lint'],
    },
    ci: {
      files: ['.gitlab-ci.yml', '.circleci/config.yml', 'azure-pipelines.yml'],
      dirs: ['.github/workflows'],
    },
  },
};

export function loadConfig(target: string): VeridiaConfig {
  const configPath = join(target, '.veridia', 'config.json');
  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, 'utf8');
      const user = JSON.parse(raw) as Partial<VeridiaConfig>;
      return mergeConfig(DEFAULT_CONFIG, user);
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

function mergeConfig(base: VeridiaConfig, user: Partial<VeridiaConfig>): VeridiaConfig {
  const result = { ...base };
  if (user.classify?.patterns) {
    result.classify = { patterns: { ...base.classify.patterns, ...user.classify.patterns } };
  }
  if (user.probes) {
    result.probes = { ...base.probes, ...user.probes };
  }
  return result;
}
