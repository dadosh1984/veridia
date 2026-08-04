import fs from 'node:fs'
import path from 'node:path'
import { cancel, intro, isCancel, multiselect, note, outro, select, spinner, text } from '@clack/prompts'
import { getAgent, getAllAgents } from '../../agent/agents.js'
import type { AgentInfo } from '../../agent/types.js'
import { DEFAULT_CONFIG } from '../../config/config.js'
import { generateCommands } from '../../generate/generate.js'
import { installSkills } from '../../generate/skills.js'
import { shouldPrompt } from '../../util/interactive.js'
import { jsonOut } from '../shared.js'

const STACK_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'node', label: 'Node.js / Express' },
  { value: 'nest', label: 'NestJS' },
  { value: 'next', label: 'Next.js' },
  { value: 'other', label: 'Other' },
]

const TEST_OPTIONS = [
  { value: 'vitest', label: 'Vitest' },
  { value: 'jest', label: 'Jest' },
  { value: 'playwright', label: 'Playwright' },
  { value: 'mocha', label: 'Mocha' },
  { value: 'none', label: 'None' },
]

const LINT_OPTIONS = [
  { value: 'biome', label: 'Biome' },
  { value: 'eslint', label: 'ESLint' },
  { value: 'none', label: 'None' },
]

const CI_OPTIONS = [
  { value: 'github', label: 'GitHub Actions' },
  { value: 'gitlab', label: 'GitLab CI' },
  { value: 'circle', label: 'CircleCI' },
  { value: 'none', label: 'None' },
]

function generateCiConfig(_stack: string[], test: string, lint: string, ci: string): string | null {
  if (ci === 'none') return null
  const testCmd = test === 'none' ? '' : test === 'playwright' ? 'npx playwright test' : `pnpm ${test === 'vitest' ? 'test' : 'test'}`
  const lintCmd = lint === 'none' ? '' : lint === 'biome' ? 'pnpm lint' : 'pnpm lint'
  const steps = ['pnpm install', 'pnpm build']
  if (lintCmd) steps.push(lintCmd)
  if (testCmd) steps.push(testCmd)

  if (ci === 'github') {
    return `name: Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
${steps.map((s) => `      - run: ${s}`).join('\n')}`
  }
  return null
}

export function buildAgentChoices(target: string, agents: AgentInfo[] = getAllAgents()) {
  return agents.map((agent) => ({
    value: agent.id,
    label: agent.name,
    hint: fs.existsSync(path.join(target, agent.configDir)) ? 'detected' : undefined,
  }))
}

export function formatInitSummary(setup: Array<{ agent: string; commandsGenerated: string[]; skillsInstalled: string[] }>): string {
  const lines = setup.map((s) => {
    const cmds = s.commandsGenerated.length > 0 ? `${s.commandsGenerated.length} command(s)` : 'skills-only'
    return `  ${s.agent}: ${cmds}, ${s.skillsInstalled.length} skill(s)`
  })
  return `veridia initialized for:\n${lines.join('\n')}\nconfig: .veridia/config.json\n`
}

function ensureConfig(target: string): void {
  const configDir = path.join(target, '.veridia')
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })
  const configPath = path.join(configDir, 'config.json')
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, 'utf8')
  }
}

export async function handle(opts: { agent?: string; noInteractive?: boolean; wizard?: boolean }): Promise<void> {
  const target = process.cwd()
  const noInteractive = opts.noInteractive ?? false
  const agentIds = opts.agent ? [opts.agent] : []

  ensureConfig(target)

  let agents: AgentInfo[]
  let interactive = false

  if (opts.wizard) {
    interactive = true
    intro('veridia init wizard')

    const projectName = await text({
      message: 'What is your project name?',
      placeholder: 'my-project',
      validate: (v) => (v ? undefined : 'Project name is required'),
    })
    if (isCancel(projectName)) {
      cancel('Cancelled')
      return
    }

    const stack = await multiselect({
      message: 'Select your stack:',
      options: STACK_OPTIONS,
      required: false,
    })
    if (isCancel(stack)) {
      cancel('Cancelled')
      return
    }

    const test = await select({
      message: 'Select test framework:',
      options: TEST_OPTIONS,
    })
    if (isCancel(test)) {
      cancel('Cancelled')
      return
    }

    const lint = await select({
      message: 'Select linter:',
      options: LINT_OPTIONS,
    })
    if (isCancel(lint)) {
      cancel('Cancelled')
      return
    }

    const ci = await select({
      message: 'Select CI:',
      options: CI_OPTIONS,
    })
    if (isCancel(ci)) {
      cancel('Cancelled')
      return
    }

    const agentChoices = buildAgentChoices(target)
    const selectedAgent = await select({
      message: 'Select AI agent:',
      options: agentChoices,
    })
    if (isCancel(selectedAgent)) {
      cancel('Cancelled')
      return
    }

    const agent = getAgent(selectedAgent as string)
    if (!agent) {
      process.stderr.write('veridia: unknown agent\n')
      process.exitCode = 1
      return
    }
    agents = [agent]

    const ciConfig = generateCiConfig(stack as string[], test as string, lint as string, ci as string)
    if (ciConfig) {
      const ciDir = path.join(target, '.github', 'workflows')
      fs.mkdirSync(ciDir, { recursive: true })
      fs.writeFileSync(path.join(ciDir, 'quality.yml'), ciConfig, 'utf8')
    }

    const spin = spinner()
    spin.start('Installing skills...')
    const commands = agent.skillsOnly ? [] : generateCommands(agent, target)
    const skills = installSkills(agent, target)
    spin.stop('Done')

    note(`Project: ${projectName}\nStack: ${(stack as string[]).join(', ')}\nTest: ${test}\nLint: ${lint}\nCI: ${ci}\nAgent: ${selectedAgent}`, 'Summary')

    const setup = [{ agent: agent.id, commandsGenerated: commands, skillsInstalled: skills }]
    process.stdout.write(formatInitSummary(setup))
    outro('veridia is ready!')
    return
  }

  if (agentIds.length > 0) {
    agents = []
    for (const id of agentIds) {
      const agent = getAgent(id)
      if (!agent) {
        process.stderr.write(`veridia: init: unknown agent: ${id}\n`)
        process.exitCode = 1
        return
      }
      agents.push(agent)
    }
  } else if (shouldPrompt({ noInteractive })) {
    interactive = true
    const choices = buildAgentChoices(target)
    const selectedId = await select({
      message: 'Select an AI agent to initialize:',
      options: choices,
    })
    if (isCancel(selectedId) || !selectedId) {
      cancel('Initialisation cancelled')
      process.exitCode = 1
      return
    }
    const agent = getAgent(selectedId as string)
    if (!agent) {
      process.stderr.write(`veridia: init: unknown agent: ${selectedId}\n`)
      process.exitCode = 1
      return
    }
    agents = [agent]
  } else {
    process.stderr.write('veridia: init requires --agent <name> (or an interactive terminal)\n')
    process.exitCode = 1
    return
  }

  const setup = agents.map((agent) => {
    const commands = agent.skillsOnly ? [] : generateCommands(agent, target)
    const skills = installSkills(agent, target)
    return { agent: agent.id, commandsGenerated: commands, skillsInstalled: skills }
  })

  if (interactive) {
    process.stdout.write(formatInitSummary(setup))
    return
  }
  jsonOut({ initialized: true, agents: setup, configFile: '.veridia/config.json' })
}
