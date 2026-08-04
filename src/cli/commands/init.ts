import fs from 'node:fs'
import path from 'node:path'
import { select, isCancel, cancel } from '@clack/prompts'
import { getAllAgents, getAgent } from '../../agent/agents.js'
import type { AgentInfo } from '../../agent/types.js'
import { DEFAULT_CONFIG } from '../../config/config.js'
import { generateCommands } from '../../generate/generate.js'
import { installSkills } from '../../generate/skills.js'
import { shouldPrompt } from '../../util/interactive.js'
import { jsonOut } from '../shared.js'

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
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8')
  }
}

export async function handle(opts: { agent?: string; noInteractive?: boolean }): Promise<void> {
  const target = process.cwd()
  const noInteractive = opts.noInteractive ?? false
  const agentIds = opts.agent ? [opts.agent] : []

  ensureConfig(target)

  let agents: AgentInfo[]
  let interactive = false
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
