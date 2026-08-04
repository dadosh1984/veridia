import fs from 'node:fs';
import path from 'node:path';
import { getAllAgents, getAgent } from '../../agent/agents.js';
import type { AgentInfo } from '../../agent/types.js';
import { DEFAULT_CONFIG } from '../../config/config.js';
import { generateCommands } from '../../generate/generate.js';
import { installSkills } from '../../generate/skills.js';
import { checkboxSelect } from '../../prompts/checkbox-select.js';
import { shouldPrompt } from '../../util/interactive.js';
import { jsonOut } from '../shared.js';

export function buildAgentChoices(target: string, agents: AgentInfo[] = getAllAgents()) {
  return agents.map((agent) => ({
    value: agent.id,
    label: agent.name,
    selected: fs.existsSync(path.join(target, agent.configDir)),
  }));
}

function parseAgentIds(args: string[]): string[] {
  const ids: string[] = [];
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--agent' && args[i + 1]) {
      ids.push(args[i + 1]);
      i++;
    }
  }
  return ids;
}

function ensureConfig(target: string): void {
  const configDir = path.join(target, '.veridia');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8');
  }
}

export async function handle(args: string[]): Promise<void> {
  const target = process.cwd();
  const noInteractive = args.includes('--no-interactive');
  const agentIds = parseAgentIds(args);

  ensureConfig(target);

  let agents: AgentInfo[];
  if (agentIds.length > 0) {
    agents = [];
    for (const id of agentIds) {
      const agent = getAgent(id);
      if (!agent) {
        process.stderr.write(`veridia: init: unknown agent: ${id}\n`);
        process.exitCode = 1;
        return;
      }
      agents.push(agent);
    }
  } else if (shouldPrompt({ noInteractive })) {
    const selectedIds = await checkboxSelect(buildAgentChoices(target));
    agents = selectedIds.map((id) => getAgent(id) as AgentInfo);
    if (agents.length === 0) {
      process.stderr.write('veridia: init: no agent selected\n');
      process.exitCode = 1;
      return;
    }
  } else {
    process.stderr.write('veridia: init requires --agent <name> (or an interactive terminal)\n');
    process.exitCode = 1;
    return;
  }

  const setup = agents.map((agent) => {
    const commands = agent.skillsOnly ? [] : generateCommands(agent, target);
    const skills = installSkills(agent, target);
    return { agent: agent.id, commandsGenerated: commands, skillsInstalled: skills };
  });

  jsonOut({ initialized: true, agents: setup, configFile: '.veridia/config.json' });
}
