import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { cancel, intro, isCancel, note, outro, select } from '@clack/prompts'
import { jsonOut } from '../shared.js'

const CI_TEMPLATES: Record<string, (config: CiConfig) => string> = {
  'github-actions': (c) => `name: Quality

on:
  push:
    branches: [${c.branch}]
  pull_request:
    branches: [${c.branch}]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '${c.nodeVersion}'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
${c.linter ? `      - run: pnpm ${c.linter === 'biome' ? 'lint' : 'lint'}` : ''}
      - run: pnpm typecheck
      - run: pnpm build
      - run: pnpm test
      - run: pnpm coverage
      - name: Self-dogfooding
        run: npx veridia run "verify project quality" --self --auto
`,
  'gitlab-ci': (c) => `image: node:${c.nodeVersion}

stages:
  - quality

quality:
  stage: quality
  before_script:
    - npm install -g pnpm
    - pnpm install --frozen-lockfile
  script:
${c.linter ? `    - pnpm ${c.linter === 'biome' ? 'lint' : 'lint'}` : ''}
    - pnpm typecheck
    - pnpm build
    - pnpm test
    - pnpm coverage
    - npx veridia run "verify project quality" --self --auto
`,
  circleci: (c) => `version: 2.1

jobs:
  quality:
    docker:
      - image: cimg/node:${c.nodeVersion}
    steps:
      - checkout
      - run: npm install -g pnpm
      - run: pnpm install --frozen-lockfile
${c.linter ? `      - run: pnpm ${c.linter === 'biome' ? 'lint' : 'lint'}` : ''}
      - run: pnpm typecheck
      - run: pnpm build
      - run: pnpm test
      - run: pnpm coverage
      - run: npx veridia run "verify project quality" --self --auto
`,
}

interface CiConfig {
  provider: string
  branch: string
  nodeVersion: string
  linter: string | null
  testFramework: string
}

export async function handle(opts: { provider?: string; output?: string; json?: boolean }): Promise<void> {
  let config: CiConfig

  if (opts.json) {
    config = {
      provider: opts.provider ?? 'github-actions',
      branch: 'main',
      nodeVersion: '22',
      linter: 'biome',
      testFramework: 'vitest',
    }
    const template = CI_TEMPLATES[config.provider]
    if (!template) {
      process.stderr.write(`veridia: ci: unknown provider: ${config.provider}. Supported: ${Object.keys(CI_TEMPLATES).join(', ')}\n`)
      process.exitCode = 1
      return
    }
    const content = template(config)
    jsonOut({ provider: config.provider, content })
    return
  }

  intro('veridia ci')

  const provider = await select({
    message: 'Select CI provider:',
    options: [
      { value: 'github-actions', label: 'GitHub Actions' },
      { value: 'gitlab-ci', label: 'GitLab CI' },
      { value: 'circleci', label: 'CircleCI' },
    ],
  })
  if (isCancel(provider)) {
    cancel('Cancelled')
    return
  }

  const linter = await select({
    message: 'Select linter:',
    options: [
      { value: 'biome', label: 'Biome' },
      { value: 'eslint', label: 'ESLint' },
      { value: 'none', label: 'None' },
    ],
  })
  if (isCancel(linter)) {
    cancel('Cancelled')
    return
  }

  config = {
    provider: provider as string,
    branch: 'main',
    nodeVersion: '22',
    linter: linter === 'none' ? null : (linter as string),
    testFramework: 'vitest',
  }

  const template = CI_TEMPLATES[config.provider]
  if (!template) {
    process.stderr.write(`veridia: ci: unknown provider: ${config.provider}\n`)
    process.exitCode = 1
    return
  }

  const content = template(config)
  const outputPath =
    opts.output ??
    (config.provider === 'github-actions' ? '.github/workflows/quality.yml' : config.provider === 'gitlab-ci' ? '.gitlab-ci.yml' : '.circleci/config.yml')

  const fullPath = join(process.cwd(), outputPath)
  mkdirSync(join(fullPath, '..'), { recursive: true })
  writeFileSync(fullPath, content, 'utf8')

  note(`Written to ${fullPath}`, 'veridia ci')
  outro(`CI config generated for ${config.provider}`)
}
