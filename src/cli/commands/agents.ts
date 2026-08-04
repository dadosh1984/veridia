import { formatInvocation, getAllAgents } from '../../agent/agents.js'
import { jsonOut } from '../shared.js'

export function handle(opts: { list?: boolean }): void {
  if (opts.list) {
    const agents = getAllAgents()
    jsonOut({ agents: agents.map((a) => ({ id: a.id, name: a.name, configDir: a.configDir, invocation: formatInvocation(a, 'command') })) })
  } else {
    process.stderr.write('veridia: agents requires --list\n')
    process.exitCode = 1
  }
}
