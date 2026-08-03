export interface AgentInfo {
  id: string;
  name: string;
  configDir: string;
  invocationPrefix: string;
  invocationStyle: 'namespaced' | 'flat';
  skillsOnly: boolean;
}

export interface AgentInstruction {
  instruction: string;
  context: Record<string, unknown>;
  expectedOutput: string;
  agent: AgentInfo | null;
}
