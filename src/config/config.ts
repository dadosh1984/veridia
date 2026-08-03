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
  models: Record<string, { provider: string; model: string }>;
  workflows: Record<string, string[]>;
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
  models: {
    cheapest: { provider: 'openai', model: 'gpt-4o-mini' },
    mid: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
    any: { provider: 'openai', model: 'gpt-4o' },
  },
  workflows: {
    bugfix: ['ask', 'write-failing-test', 'implement', 'verify'],
    refactor: ['ask', 'write-failing-test', 'implement', 'verify'],
    feature: ['ask', 'write-failing-test', 'implement', 'verify'],
    doc: ['ask', 'document', 'review'],
    explore: ['ask', 'research', 'present-options'],
    open: ['ask', 'research', 'present-options'],
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
  if (user.models) {
    result.models = { ...base.models, ...user.models };
  }
  if (user.workflows) {
    result.workflows = { ...base.workflows, ...user.workflows };
  }
  return result;
}
