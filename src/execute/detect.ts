import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAgent } from '../agent/agents.js';
import type { HostAgentInfo } from './types.js';

const ENV_MAP: Record<string, string> = {
  CLAUDE_CODE: 'claude',
  OPENCODE: 'opencode',
  CURSOR: 'cursor',
  GITHUB_COPILOT: 'github-copilot',
  GEMINI: 'gemini',
  CLINE: 'cline',
  KILO_CODE: 'kilocode',
  AUGGIE: 'auggie',
  DEVIN: 'devin',
  CODEBUDDY: 'codebuddy',
  CONTINUE: 'continue',
  JUNIE: 'junie',
  QWEN: 'qwen',
  TRAE: 'trae',
};

const CONFIG_DIR_MAP: Record<string, string> = {
  '.claude': 'claude',
  '.opencode': 'opencode',
  '.cursor': 'cursor',
  '.github': 'github-copilot',
  '.gemini': 'gemini',
  '.cline': 'cline',
  '.kilocode': 'kilocode',
  '.augment': 'auggie',
  '.devin': 'devin',
  '.codebuddy': 'codebuddy',
  '.continue': 'continue',
  '.junie': 'junie',
  '.qwen': 'qwen',
  '.trae': 'trae',
};

export function detectHostAgent(target?: string): HostAgentInfo {
  for (const [envVar, agentId] of Object.entries(ENV_MAP)) {
    if (process.env[envVar]) {
      const agent = getAgent(agentId);
      if (agent) {
        return {
          id: agent.id,
          name: agent.name,
          delegationModes: agent.delegationModes,
          canWriteFiles: agent.canWriteFiles,
          canRunShell: agent.canRunShell,
          canCallModels: agent.canCallModels,
        };
      }
    }
  }

  const searchRoot = target ?? process.cwd();
  for (const [configDir, agentId] of Object.entries(CONFIG_DIR_MAP)) {
    if (existsSync(join(searchRoot, configDir))) {
      const agent = getAgent(agentId);
      if (agent) {
        return {
          id: agent.id,
          name: agent.name,
          delegationModes: agent.delegationModes,
          canWriteFiles: agent.canWriteFiles,
          canRunShell: agent.canRunShell,
          canCallModels: agent.canCallModels,
        };
      }
    }
  }

  return {
    id: 'shell',
    name: 'Generic Shell',
    delegationModes: ['shell'],
    canWriteFiles: false,
    canRunShell: true,
    canCallModels: false,
  };
}
