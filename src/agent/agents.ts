import type { AgentInfo } from './types.js';

const AGENTS: AgentInfo[] = [
  { id: 'amazon-q', name: 'Amazon Q Developer', configDir: '.amazonq', invocationPrefix: '@', invocationStyle: 'flat', skillsOnly: false },
  { id: 'antigravity', name: 'Antigravity', configDir: '.agent', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'auggie', name: 'Auggie (Augment CLI)', configDir: '.augment', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'bob', name: 'Bob Shell', configDir: '.bob', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'claude', name: 'Claude Code', configDir: '.claude', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'cline', name: 'Cline', configDir: '.cline', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'codeartsagent', name: 'CodeArts', configDir: '.codeartsdoer', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
  { id: 'codebuddy', name: 'CodeBuddy Code (CLI)', configDir: '.codebuddy', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'codex', name: 'Codex CLI', configDir: '.codex', invocationPrefix: '$', invocationStyle: 'flat', skillsOnly: true },
  { id: 'continue', name: 'Continue', configDir: '.continue', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'costrict', name: 'CoStrict', configDir: '.cospec', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'crush', name: 'Crush', configDir: '.crush', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'cursor', name: 'Cursor', configDir: '.cursor', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'devin', name: 'Devin Desktop (formerly Windsurf)', configDir: '.devin', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'factory', name: 'Factory Droid', configDir: '.factory', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'forgecode', name: 'ForgeCode', configDir: '.forge', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
  { id: 'gemini', name: 'Gemini CLI', configDir: '.gemini', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'github-copilot', name: 'GitHub Copilot', configDir: '.github', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'hermes', name: 'Hermes Agent', configDir: '.hermes', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
  { id: 'iflow', name: 'iFlow', configDir: '.iflow', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'junie', name: 'Junie', configDir: '.junie', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'kilocode', name: 'Kilo Code', configDir: '.kilocode', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'kimi', name: 'Kimi Code', configDir: '.kimi-code', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
  { id: 'kiro', name: 'Kiro', configDir: '.kiro', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'lingma', name: 'Lingma', configDir: '.lingma', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'vibe', name: 'Mistral Vibe', configDir: '.vibe', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
  { id: 'oh-my-pi', name: 'Oh My Pi', configDir: '.omp', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'opencode', name: 'OpenCode', configDir: '.opencode', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'pi', name: 'Pi', configDir: '.pi', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'qoder', name: 'Qoder', configDir: '.qoder', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'qwen', name: 'Qwen Code', configDir: '.qwen', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'roocode', name: 'Zoo Code', configDir: '.roo', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'trae', name: 'Trae', configDir: '.trae', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false },
  { id: 'zcode', name: 'ZCode', configDir: '.zcode', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false },
  { id: 'agents', name: 'Shared .agents skills', configDir: '.agents', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true },
];

export function getAgent(id: string): AgentInfo | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getAllAgents(): AgentInfo[] {
  return [...AGENTS];
}

export function formatInvocation(agent: AgentInfo, commandId: string): string {
  const separator = agent.invocationStyle === 'namespaced' ? ':' : '-';
  return `${agent.invocationPrefix}ww${separator}${commandId}`;
}
