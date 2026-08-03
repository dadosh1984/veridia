import { getAgent } from '../../agent/agents.js';
import { generateCommands } from '../../generate/generate.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const agentIdx = args.indexOf('--agent');
  const agentId = agentIdx >= 0 && args[agentIdx + 1] ? args[agentIdx + 1] : '';
  if (!agentId) {
    process.stderr.write('veridia: generate requires --agent <name>\n');
    process.exitCode = 1;
    return;
  }
  const agent = getAgent(agentId);
  if (!agent) {
    process.stderr.write(`veridia: generate: unknown agent: ${agentId}\n`);
    process.exitCode = 1;
    return;
  }
  const target = process.cwd();
  const generated = generateCommands(agent, target);
  jsonOut({ generated: true, agent: agentId, commandsGenerated: generated });
}
