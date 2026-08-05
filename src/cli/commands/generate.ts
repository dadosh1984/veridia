import { getAgent } from '../../agent/agents.js'
import { generateCommands } from '../../generate/generate.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { agent: string }): void {
  const agent = getAgent(opts.agent)
  if (!agent) {
    vlog.error(`generate: unknown agent: ${opts.agent}`)
    process.exitCode = 1
    return
  }
  const target = process.cwd()
  const generated = generateCommands(agent, target)
  jsonOut({ generated: true, agent: opts.agent, commandsGenerated: generated })
}
