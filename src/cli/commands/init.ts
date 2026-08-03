import fs from 'node:fs';
import path from 'node:path';
import { getAgent } from '../../agent/agents.js';
import { DEFAULT_CONFIG } from '../../config/config.js';
import { generateCommands } from '../../generate/generate.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const agentIdx = args.indexOf('--agent');
  const agentId = agentIdx >= 0 && args[agentIdx + 1] ? args[agentIdx + 1] : '';
  if (!agentId) {
    process.stderr.write('veridia: init requires --agent <name>\n');
    process.exitCode = 1;
    return;
  }
  const agent = getAgent(agentId);
  if (!agent) {
    process.stderr.write(`veridia: init: unknown agent: ${agentId}\n`);
    process.exitCode = 1;
    return;
  }
  const target = process.cwd();
  const configDir = path.join(target, '.veridia');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  const configPath = path.join(configDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8');
  }
  const generated = generateCommands(agent, target);
  jsonOut({ initialized: true, agent: agentId, configFile: '.veridia/config.json', commandsGenerated: generated });
}
