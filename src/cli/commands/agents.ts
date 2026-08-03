import { getAllAgents, formatInvocation } from '../../agent/agents.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  if (args[1] === '--list') {
    const agents = getAllAgents();
    jsonOut({ agents: agents.map((a) => ({ id: a.id, name: a.name, configDir: a.configDir, invocation: formatInvocation(a, 'command') })) });
  } else {
    process.stderr.write('veridia: agents requires --list\n');
    process.exitCode = 1;
  }
}
