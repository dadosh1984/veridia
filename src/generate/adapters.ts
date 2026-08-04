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
  { id: 'plan', name: 'veridia plan', description: 'Generate an execution plan for the host agent', body: 'Run `veridia plan --type <type> --level <level> [--files <files>] [--target <path>]` to generate an execution plan. Returns JSON with steps, gates, and metadata.' },
  { id: 'execute', name: 'veridia execute', description: 'Execute a plan via the host agent', body: 'Run `veridia execute --type <type> --level <level> [--files <files>] [--target <path>]` to delegate execution to the host agent. Returns JSON with exit code and output.' },
  { id: 'verify', name: 'veridia verify', description: 'Run a target checks and print a verdict', body: 'Run `veridia verify --target <path> --type <type> --level <level>` to verify. Returns JSON with checks and verdict.' },
  { id: 'measure', name: 'veridia measure', description: 'Record a run outcome or print history', body: 'Run `veridia measure --record <json>` to record or `veridia measure --history` to view history. Returns JSON.' },
  { id: 'review', name: 'veridia review', description: 'Output code review instructions for an AI agent', body: 'Run `veridia review --target <path>` to get code review instructions. Returns JSON with files, patterns, and analysis.' },
  { id: 'agents', name: 'veridia agents', description: 'List all supported AI agents', body: 'Run `veridia agents --list` to see all supported agents. Returns JSON with agents array.' },
  { id: 'triage', name: 'veridia triage', description: 'Run the full triage loop on a task string', body: 'Run `veridia <task>` to run the full triage loop. Returns JSON with type, level, plan, questions, verdict, execution plan, and execution result.' },
  { id: 'run', name: 'veridia run', description: 'Run the full triage loop with live progress and human-readable output', body: 'Run `veridia run <task>` to execute the full triage loop: classify, assess, route, ask, plan, execute, verify, measure. Prints live `→ <stage>` progress, then a summary verdict (PASS/FAIL/HUMAN).' },
  { id: 'intro', name: 'veridia intro', description: 'How to use veridia (onboarding)', body: 'Explain how to use veridia: `veridia run <task>` runs the whole pipeline; `veridia session-classify <task>` starts the step-by-step flow. See docs/usage.md for the guide.' },
  { id: 'session-classify', name: 'veridia session-classify', description: 'Classify a task and write it to the veridia session', body: 'Run `veridia session-classify <task>` to classify and advance the session to assess.' },
  { id: 'session-assess', name: 'veridia session-assess', description: 'Assess verifiability and write the level to the session', body: 'Run `veridia session-assess [--target <path>]` to probe the target and advance the session to route.' },
  { id: 'session-route', name: 'veridia session-route', description: 'Build the run plan into the session', body: 'Run `veridia session-route` to build a plan from the session type and level; advances to ask.' },
  { id: 'session-ask', name: 'veridia session-ask', description: 'Ask clarifying questions from the session', body: 'Run `veridia session-ask` to ask clarifying questions (levels 0/1); advances to do.' },
  { id: 'session-do', name: 'veridia session-do', description: 'Execute the plan and verify', body: 'Run `veridia session-do` to execute the session plan, verify, and record the outcome; advances to done.' },
  { id: 'session-status', name: 'veridia session-status', description: 'Show the current session state', body: 'Run `veridia session-status` to see the current session task, type, level, plan, and step.' },
  { id: 'session-archive', name: 'veridia session-archive', description: 'Finalize and archive the session to history', body: 'Run `veridia session-archive` to clear the completed session and record it to history.' },
];

export function getCommandFiles(agent: AgentInfo): CommandFile[] {
  const adapter = getAdapter(agent);
  return COMMANDS.map((cmd) => ({
    path: adapter.getFilePath(cmd.id),
    content: adapter.formatFile(cmd.name, cmd.description, cmd.body),
  }));
}
