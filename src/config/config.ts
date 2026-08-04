import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The veridia configuration schema. */
export interface VeridiaConfig {
  /** Classification pattern overrides per task type. */
  classify: {
    /** Map of task type to array of regex pattern strings. */
    patterns: Record<string, string[]>
  }
  /** Probe definitions for detecting verification oracles. */
  probes: {
    /** Test runner probe configuration. */
    'test-runner': { files: string[]; scripts: string[] }
    /** Type checker probe configuration. */
    'type-check': { files: string[]; scripts: string[] }
    /** Linter probe configuration. */
    lint: { files: string[]; scripts: string[] }
    /** CI probe configuration. */
    ci: { files: string[]; dirs: string[]; dirExts: string[] }
    /** Dead code analysis probe (knip). */
    'dead-code': { files: string[]; scripts: string[] }
    /** Bundler/linter probe (oxc). */
    bundler: { files: string[]; scripts: string[] }
  }
  /** Optional AI model configuration. */
  model?: {
    /** The provider type. */
    provider: 'stdio' | 'api'
    /** The model identifier. */
    model: string
    /** Optional API key. */
    apiKey?: string
    /** Optional temperature setting. */
    temperature?: number
    /** Optional max tokens. */
    maxTokens?: number
    /** The command for stdio-based providers. */
    command?: string
    /** The API URL for API-based providers. */
    apiUrl?: string
  }
  /** Optional custom weight overrides per oracle kind. */
  weights?: Record<string, number>
}

/** The default veridia configuration with built-in classification patterns and probe definitions. */
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
      files: [
        'vitest.config.ts',
        'vitest.config.js',
        'vitest.config.mts',
        'vitest.config.mjs',
        'jest.config.ts',
        'jest.config.js',
        'jest.config.mjs',
        'playwright.config.ts',
        '.mocharc.json',
        'karma.conf.js',
      ],
      scripts: ['test'],
    },
    'type-check': {
      files: ['tsconfig.json'],
      scripts: ['typecheck', 'type-check'],
    },
    lint: {
      files: ['eslint.config.js', 'eslint.config.ts', 'eslint.config.mjs', '.eslintrc', '.eslintrc.json', '.eslintrc.js'],
      scripts: ['lint'],
    },
    ci: {
      files: ['.gitlab-ci.yml', '.circleci/config.yml', 'azure-pipelines.yml'],
      dirs: ['.github/workflows'],
      dirExts: ['.yml', '.yaml'],
    },
    'dead-code': {
      files: ['knip.json', 'knip.ts', '.knip.json', 'knip.config.ts', 'knip.config.js'],
      scripts: ['knip'],
    },
    bundler: {
      files: ['oxc.json', '.oxrc.json', 'oxlint.json', '.oxlintrc.json'],
      scripts: ['oxlint'],
    },
  },
}

/**
 * Load the veridia configuration from .veridia/config.json in the target directory.
 * Falls back to DEFAULT_CONFIG if the file does not exist or is invalid.
 *
 * @param target - The project root directory.
 * @returns The merged VeridiaConfig (user config merged over defaults).
 */
export function loadConfig(target: string): VeridiaConfig {
  const configPath = join(target, '.veridia', 'config.json')
  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '')
      const user = JSON.parse(raw) as Partial<VeridiaConfig>
      return mergeConfig(DEFAULT_CONFIG, user)
    } catch {
      return DEFAULT_CONFIG
    }
  }
  return DEFAULT_CONFIG
}

/**
 * Extract the model configuration from a VeridiaConfig, resolving the API key
 * from the config or the VERIDIA_API_KEY environment variable.
 *
 * @param config - The veridia configuration.
 * @returns The model config object, or undefined if no model is configured.
 */
export function getModelConfig(
  config: VeridiaConfig,
): { provider: 'stdio' | 'api'; model: string; apiKey?: string; temperature?: number; maxTokens?: number; command?: string; apiUrl?: string } | undefined {
  if (!config.model) return undefined
  const apiKey = config.model.apiKey || process.env.VERIDIA_API_KEY
  return { ...config.model, apiKey }
}

function mergeConfig(base: VeridiaConfig, user: Partial<VeridiaConfig>): VeridiaConfig {
  const result = { ...base }
  if (user.classify?.patterns) {
    result.classify = { patterns: { ...base.classify.patterns, ...user.classify.patterns } }
  }
  if (user.probes) {
    result.probes = { ...base.probes, ...user.probes }
  }
  if (user.model) {
    result.model = { ...user.model }
  }
  if (user.weights) {
    result.weights = { ...user.weights }
  }
  return result
}
