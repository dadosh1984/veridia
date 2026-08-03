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
    expect(formatInvocation(agent, 'apply')).toBe('/ww:apply');
  });

  it('formats flat invocation (cursor)', () => {
    const agent = getAgent('cursor')!;
    expect(formatInvocation(agent, 'apply')).toBe('/ww-apply');
  });

  it('formats amazon-q invocation with @ prefix', () => {
    const agent = getAgent('amazon-q')!;
    expect(formatInvocation(agent, 'apply')).toBe('@ww-apply');
  });
});
