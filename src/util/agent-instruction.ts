import type { AgentInfo, AgentInstruction } from '../agent/types.js';

export function buildAgentInstruction(
  instruction: string,
  context: Record<string, unknown>,
  expectedOutput: string,
  agent: AgentInfo | null = null,
): AgentInstruction {
  return { instruction, context, expectedOutput, agent };
}

export function formatAgentInstructionJson(ai: AgentInstruction): string {
  return JSON.stringify(ai, null, 2);
}
