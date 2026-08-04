import { describe, expect, it, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ExecutionPlan, HostAgentInfo, ExecuteResult, ExecutionStep, VerificationGate } from '../src/execute/types.js';
import { assemblePrompt, callModelStdio } from '../src/execute/orchestrate.js';
import { detectHostAgent } from '../src/execute/detect.js';
import { buildExecutionPlan } from '../src/execute/plan.js';
import { buildPlan } from '../src/route/route.js';
import { delegateStdout, delegateFile, delegateShell, delegate } from '../src/execute/delegate.js';

describe('ExecutionPlan', () => {
  it('has required fields', () => {
    const plan: ExecutionPlan = {
      protocol: 'veridia/execution-plan/v1',
      task: 'add dark mode',
      type: 'feature',
      level: 2,
      plan: {
        depth: 'tdd-where-possible',
        tier: 'mid',
        steps: [{ id: 'implement', action: 'implement dark mode', files: ['src/theme.ts'] }],
        gates: [{ id: 'run-tests', command: 'vitest run', kind: 'test-runner' }],
      },
      metadata: { host: 'opencode', generatedAt: '2026-01-01T00:00:00.000Z' },
    };
    expect(plan.task).toBe('add dark mode');
    expect(plan.plan.steps).toHaveLength(1);
    expect(plan.plan.gates).toHaveLength(1);
    expect(plan.metadata.host).toBe('opencode');
  });

  it('includes protocol field', () => {
    const plan: ExecutionPlan = {
      protocol: 'veridia/execution-plan/v1',
      task: 'test',
      type: 'bugfix',
      level: 3,
      plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
      metadata: { host: 'claude', generatedAt: '2026-01-01T00:00:00.000Z' },
    };
    expect(plan.protocol).toBe('veridia/execution-plan/v1');
  });

  it('is serializable to JSON', () => {
    const plan: ExecutionPlan = {
      protocol: 'veridia/execution-plan/v1',
      task: 'test',
      type: 'bugfix',
      level: 3,
      plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
      metadata: { host: 'claude', generatedAt: '2026-01-01T00:00:00.000Z' },
    };
    const json = JSON.stringify(plan);
    const parsed = JSON.parse(json) as ExecutionPlan;
    expect(parsed.task).toBe('test');
    expect(parsed.type).toBe('bugfix');
    expect(parsed.protocol).toBe('veridia/execution-plan/v1');
  });
});

describe('HostAgentInfo', () => {
  it('can represent a known agent', () => {
    const agent: HostAgentInfo = {
      id: 'opencode',
      name: 'OpenCode',
      delegationModes: ['stdout', 'file'],
      canWriteFiles: true,
      canRunShell: true,
      canCallModels: true,
    };
    expect(agent.delegationModes).toContain('stdout');
    expect(agent.canWriteFiles).toBe(true);
  });
});

describe('ExecuteResult', () => {
  it('holds exit code and output', () => {
    const result: ExecuteResult = { exitCode: 0, stdout: 'done', stderr: '' };
    expect(result.exitCode).toBe(0);
  });
});

describe('detectHostAgent', () => {
  const OLD_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('detects host from environment variable', () => {
    process.env.OPENCODE = '1';
    const host = detectHostAgent();
    expect(host.id).toBe('opencode');
    expect(host.delegationModes).toContain('stdout');
  });

  it('falls back to generic shell when no agent detected', () => {
    for (const key of Object.keys(process.env)) {
      if (key in { CLAUDE_CODE: 1, OPENCODE: 1, CURSOR: 1, GITHUB_COPILOT: 1, GEMINI: 1, CLINE: 1, KILO_CODE: 1, AUGGIE: 1, DEVIN: 1, CODEBUDDY: 1, CONTINUE: 1, JUNIE: 1, QWEN: 1, TRAE: 1 }) {
        delete process.env[key];
      }
    }
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-detect-'));
    try {
      const host = detectHostAgent(tmpDir);
      expect(host.id).toBe('shell');
      expect(host.delegationModes).toEqual(['shell']);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects claude from environment variable', () => {
    process.env.CLAUDE_CODE = '1';
    const host = detectHostAgent();
    expect(host.id).toBe('claude');
    expect(host.canCallModels).toBe(true);
  });
});

describe('buildExecutionPlan', () => {
  it('creates ExecutionPlan from RunPlan for a feature at level 2', () => {
    const runPlan = buildPlan('feature', 2);
    const plan = buildExecutionPlan('add dark mode', 'feature', 2, runPlan, ['src/theme.ts']);
    expect(plan.task).toBe('add dark mode');
    expect(plan.type).toBe('feature');
    expect(plan.level).toBe(2);
    expect(plan.plan.depth).toBe('tdd-where-possible');
    expect(plan.plan.steps.length).toBeGreaterThan(0);
    expect(plan.plan.gates.length).toBeGreaterThan(0);
    expect(plan.metadata.host).toBeTruthy();
    expect(plan.metadata.generatedAt).toBeTruthy();
  });

  it('includes file targets when provided', () => {
    const runPlan = buildPlan('bugfix', 3);
    const plan = buildExecutionPlan('fix null pointer', 'bugfix', 3, runPlan, ['src/login.ts', 'src/utils.ts']);
    const implementStep = plan.plan.steps.find((s) => s.id === 'implement');
    expect(implementStep).toBeDefined();
    expect(implementStep!.files).toEqual(['src/login.ts', 'src/utils.ts']);
  });

  it('embeds route checks as verification gates', () => {
    const runPlan = buildPlan('feature', 3);
    const plan = buildExecutionPlan('test', 'feature', 3, runPlan);
    const verifyStep = plan.plan.steps.find((s) => s.id === 'verify');
    expect(verifyStep).toBeDefined();
    expect(verifyStep!.gates).toBeDefined();
    expect(verifyStep!.gates!.length).toBeGreaterThan(0);
    expect(plan.plan.gates.length).toBeGreaterThan(0);
  });

  it('is deterministic: same input yields same plan', () => {
    const runPlan = buildPlan('feature', 2);
    const a = buildExecutionPlan('task', 'feature', 2, runPlan, ['src/a.ts']);
    const b = buildExecutionPlan('task', 'feature', 2, runPlan, ['src/a.ts']);
    expect(a.task).toBe(b.task);
    expect(a.plan.steps.map((s) => s.id)).toEqual(b.plan.steps.map((s) => s.id));
  });
});

describe('delegateStdout', () => {
  it('prints plan JSON to stdout', () => {
    const plan: ExecutionPlan = {
      protocol: 'veridia/execution-plan/v1',
      task: 'test', type: 'bugfix', level: 3,
      plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
      metadata: { host: 'test', generatedAt: '' },
    };
    const result = delegateStdout(plan);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as ExecutionPlan;
    expect(parsed.task).toBe('test');
  });
});

describe('delegateFile', () => {
  it('writes plan to .veridia/plan.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-delegate-'));
    try {
      const plan: ExecutionPlan = {
        protocol: 'veridia/execution-plan/v1',
        task: 'test', type: 'bugfix', level: 3,
        plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
        metadata: { host: 'test', generatedAt: '' },
      };
      const result = delegateFile(plan, tmpDir);
      expect(result.exitCode).toBe(0);
      const planPath = path.join(tmpDir, '.veridia', 'plan.json');
      expect(fs.existsSync(planPath)).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(planPath, 'utf8')) as ExecutionPlan;
      expect(parsed.task).toBe('test');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('delegateShell', () => {
  it('returns success when no gates to run', () => {
    const plan: ExecutionPlan = {
      protocol: 'veridia/execution-plan/v1',
      task: 'test', type: 'bugfix', level: 3,
      plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
      metadata: { host: 'test', generatedAt: '' },
    };
    const result = delegateShell(plan);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('No gates');
  });
});

describe('delegate', () => {
  const OLD_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('selects file mode for opencode host (file > stdout)', async () => {
    process.env.OPENCODE = '1';
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-delegate-file-'));
    try {
      const plan: ExecutionPlan = {
        protocol: 'veridia/execution-plan/v1',
        task: 'test', type: 'bugfix', level: 3,
        plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
        metadata: { host: 'opencode', generatedAt: '' },
      };
      const result = await delegate(plan, tmpDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Plan written to');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('selects shell mode in a clean temp dir', async () => {
    for (const key of Object.keys(process.env)) {
      if (key in { CLAUDE_CODE: 1, OPENCODE: 1, CURSOR: 1, GITHUB_COPILOT: 1, GEMINI: 1, CLINE: 1, KILO_CODE: 1, AUGGIE: 1, DEVIN: 1, CODEBUDDY: 1, CONTINUE: 1, JUNIE: 1, QWEN: 1, TRAE: 1 }) {
        delete process.env[key];
      }
    }
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-delegate-shell-'));
    try {
      const plan: ExecutionPlan = {
        protocol: 'veridia/execution-plan/v1',
        task: 'test', type: 'bugfix', level: 3,
        plan: { depth: 'full-tdd', tier: 'cheapest', steps: [], gates: [] },
        metadata: { host: 'shell', generatedAt: '' },
      };
      const result = await delegate(plan, tmpDir);
      expect(result.exitCode).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('assemblePrompt', () => {
  it('includes all context fields', () => {
    const prompt = assemblePrompt('add auth', 'feature', 2, { depth: 'tdd-where-possible', tier: 'mid', steps: ['implement'], checks: ['test'] });
    expect(prompt).toContain('add auth');
    expect(prompt).toContain('feature');
    expect(prompt).toContain('2');
    expect(prompt).toContain('tdd-where-possible');
  });

  it('includes answers when provided', () => {
    const prompt = assemblePrompt('add auth', 'feature', 2, { depth: 'tdd-where-possible', tier: 'mid', steps: [], checks: [] }, { framework: 'express' });
    expect(prompt).toContain('express');
  });

  it('omits answers section when no answers', () => {
    const prompt = assemblePrompt('add auth', 'feature', 2, { depth: 'tdd-where-possible', tier: 'mid', steps: [], checks: [] });
    expect(prompt).not.toContain('Answers:');
  });
});

describe('callModelStdio', () => {
  it('spawns a process and returns output', () => {
    const result = callModelStdio('node', 'process.stdout.write("hello")');
    expect(result).toBe('hello');
  });
});
