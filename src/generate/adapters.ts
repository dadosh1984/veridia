import type { AgentInfo } from '../agent/types.js';

export interface CommandFile {
  path: string;
  content: string;
}

export function getAdapter(agent: AgentInfo): { getFilePath: (id: string) => string; formatFile: (name: string, description: string, body: string) => string } {
  if (agent.invocationStyle === 'namespaced') {
    return {
      getFilePath: (id: string) => `${agent.configDir}/commands/veridia/${id}.md`,
      formatFile: (name: string, description: string, body: string) =>
        `---
name: ${name}
description: ${description}
---

${body}
`,
    };
  }
  return {
    getFilePath: (id: string) => `${agent.configDir}/commands/veridia-${id}.md`,
    formatFile: (name: string, description: string, body: string) =>
      `---
description: ${description}
---

${body}
`,
  };
}

const COMMANDS: { id: string; name: string; description: string; body: string }[] = [
  { id: 'classify', name: 'veridia classify', description: 'Classify a task string into bugfix/refactor/feature/doc/explore/open', body: 'Run `veridia classify <task>` to classify a task. Returns JSON with type and confidence.' },
  { id: 'assess', name: 'veridia assess', description: 'Assess verifiability of a target directory', body: 'Run `veridia assess --target <path>` to assess verifiability. Returns JSON with level and oracles.' },
  { id: 'route', name: 'veridia route', description: 'Route (type, level) to a run plan', body: 'Run `veridia route --type <type> --level <level>` to get a run plan. Returns JSON with depth, tier, trust, steps, checks.' },
  { id: 'ask', name: 'veridia ask', description: 'Ask clarifying questions for levels 0/1', body: 'Run `veridia ask --type <type> --level <level>` to get clarifying questions. Returns JSON with questions array.' },
  { id: 'verify', name: 'veridia verify', description: 'Run a target checks and print a verdict', body: 'Run `veridia verify --target <path> --type <type> --level <level>` to verify. Returns JSON with checks and verdict.' },
  { id: 'measure', name: 'veridia measure', description: 'Record a run outcome or print history', body: 'Run `veridia measure --record <json>` to record or `veridia measure --history` to view history. Returns JSON.' },
  { id: 'review', name: 'veridia review', description: 'Output code review instructions for an AI agent', body: 'Run `veridia review --target <path>` to get code review instructions. Returns JSON with files, patterns, and analysis.' },
  { id: 'agents', name: 'veridia agents', description: 'List all supported AI agents', body: 'Run `veridia agents --list` to see all supported agents. Returns JSON with agents array.' },
  { id: 'triage', name: 'veridia triage', description: 'Run the full triage loop on a task string', body: 'Run `veridia <task>` to run the full triage loop. Returns JSON with type, level, plan, questions, verdict.' },
];

export function getCommandFiles(agent: AgentInfo): CommandFile[] {
  const adapter = getAdapter(agent);
  return COMMANDS.map((cmd) => ({
    path: adapter.getFilePath(cmd.id),
    content: adapter.formatFile(cmd.name, cmd.description, cmd.body),
  }));
}
