import { describe, expect, it } from 'vitest';
import { getAllAgents, getAgent, formatInvocation } from '../src/agent/agents.js';

describe('getAllAgents', () => {
  it('returns all 35 agents', () => {
    const agents = getAllAgents();
    expect(agents.length).toBe(35);
  });

  it('includes claude, cursor, and opencode', () => {
    const agents = getAllAgents();
    const ids = agents.map((a) => a.id);
    expect(ids).toContain('claude');
    expect(ids).toContain('cursor');
    expect(ids).toContain('opencode');
  });
});

describe('getAgent', () => {
  it('returns agent info for a known id', () => {
    const agent = getAgent('claude');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Claude Code');
    expect(agent!.configDir).toBe('.claude');
  });

  it('returns undefined for an unknown id', () => {
    expect(getAgent('nonexistent')).toBeUndefined();
  });
});

describe('formatInvocation', () => {
  it('formats namespaced invocation (claude)', () => {
    const agent = getAgent('claude')!;
    expect(formatInvocation(agent, 'apply')).toBe('/veridia:apply');
  });

  it('formats flat invocation (cursor)', () => {
    const agent = getAgent('cursor')!;
    expect(formatInvocation(agent, 'apply')).toBe('/veridia-apply');
  });

  it('formats amazon-q invocation with @ prefix', () => {
    const agent = getAgent('amazon-q')!;
    expect(formatInvocation(agent, 'apply')).toBe('@veridia-apply');
  });
});

describe('agent capabilities', () => {
  it('every agent has delegationModes array', () => {
    for (const agent of getAllAgents()) {
      expect(agent.delegationModes.length).toBeGreaterThan(0);
    }
  });

  it('claude supports all three delegation modes', () => {
    const agent = getAgent('claude')!;
    expect(agent.delegationModes).toContain('stdout');
    expect(agent.delegationModes).toContain('file');
    expect(agent.delegationModes).toContain('shell');
    expect(agent.canWriteFiles).toBe(true);
    expect(agent.canRunShell).toBe(true);
    expect(agent.canCallModels).toBe(true);
  });

  it('skills-only agents cannot call models or run shell', () => {
    const agent = getAgent('codex')!;
    expect(agent.canCallModels).toBe(false);
    expect(agent.canRunShell).toBe(false);
    expect(agent.delegationModes).not.toContain('shell');
  });
});
