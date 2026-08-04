import { getAgent } from '../../agent/agents.js'
import { generateCommands } from '../../generate/generate.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { agent: string }): void {
  const agent = getAgent(opts.agent)
  if (!agent) {
    process.stderr.write(`veridia: generate: unknown agent: ${opts.agent}\n`)
    process.exitCode = 1
    return
  }
  const target = process.cwd()
  const generated = generateCommands(agent, target)
  jsonOut({ generated: true, agent: opts.agent, commandsGenerated: generated })
}
