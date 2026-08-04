import type { AgentInfo } from './types.js';

const AGENTS: AgentInfo[] = [
  { id: 'amazon-q', name: 'Amazon Q Developer', configDir: '.amazonq', invocationPrefix: '@', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'antigravity', name: 'Antigravity', configDir: '.agent', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'auggie', name: 'Auggie (Augment CLI)', configDir: '.augment', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'bob', name: 'Bob Shell', configDir: '.bob', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'claude', name: 'Claude Code', configDir: '.claude', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'cline', name: 'Cline', configDir: '.cline', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'codeartsagent', name: 'CodeArts', configDir: '.codeartsdoer', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'codebuddy', name: 'CodeBuddy Code (CLI)', configDir: '.codebuddy', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'codex', name: 'Codex CLI', configDir: '.codex', invocationPrefix: '$', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'continue', name: 'Continue', configDir: '.continue', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'costrict', name: 'CoStrict', configDir: '.cospec', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'crush', name: 'Crush', configDir: '.crush', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'cursor', name: 'Cursor', configDir: '.cursor', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'devin', name: 'Devin Desktop (formerly Windsurf)', configDir: '.devin', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'factory', name: 'Factory Droid', configDir: '.factory', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'forgecode', name: 'ForgeCode', configDir: '.forge', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'gemini', name: 'Gemini CLI', configDir: '.gemini', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'github-copilot', name: 'GitHub Copilot', configDir: '.github', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'hermes', name: 'Hermes Agent', configDir: '.hermes', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'iflow', name: 'iFlow', configDir: '.iflow', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'junie', name: 'Junie', configDir: '.junie', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'kilocode', name: 'Kilo Code', configDir: '.kilocode', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'kimi', name: 'Kimi Code', configDir: '.kimi-code', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'kiro', name: 'Kiro', configDir: '.kiro', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'lingma', name: 'Lingma', configDir: '.lingma', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'vibe', name: 'Mistral Vibe', configDir: '.vibe', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
  { id: 'oh-my-pi', name: 'Oh My Pi', configDir: '.omp', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'opencode', name: 'OpenCode', configDir: '.opencode', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'pi', name: 'Pi', configDir: '.pi', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'qoder', name: 'Qoder', configDir: '.qoder', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'qwen', name: 'Qwen Code', configDir: '.qwen', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'roocode', name: 'Zoo Code', configDir: '.roo', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'trae', name: 'Trae', configDir: '.trae', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'zcode', name: 'ZCode', configDir: '.zcode', invocationPrefix: '/', invocationStyle: 'namespaced', skillsOnly: false, delegationModes: ['stdout', 'file', 'shell'], canWriteFiles: true, canRunShell: true, canCallModels: true },
  { id: 'agents', name: 'Shared .agents skills', configDir: '.agents', invocationPrefix: '/', invocationStyle: 'flat', skillsOnly: true, delegationModes: ['stdout', 'file'], canWriteFiles: true, canRunShell: false, canCallModels: false },
];

export function getAgent(id: string): AgentInfo | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getAllAgents(): AgentInfo[] {
  return [...AGENTS];
}

export function formatInvocation(agent: AgentInfo, commandId: string): string {
  const separator = agent.invocationStyle === 'namespaced' ? ':' : '-';
  return `${agent.invocationPrefix}veridia${separator}${commandId}`;
}
