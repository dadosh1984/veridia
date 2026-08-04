import { execFileSync } from 'node:child_process';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';
import { verify } from '../verify/verify.js';
import type { OracleKind } from '../assess/types.js';

export interface ModelConfig {
  provider: 'stdio' | 'api';
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  command?: string;
  apiUrl?: string;
}

export interface OrchestrateResult {
  output: string;
  verdict: Verdict;
  retries: number;
}

export function assemblePrompt(
  task: string,
  type: TaskType,
  level: VerifiabilityLevel,
  plan: { depth: string; tier: string; steps: string[]; checks: string[] },
  answers?: Record<string, string>,
): string {
  const parts = [`Task: ${task}`, `Type: ${type}`, `Verifiability level: ${level}`, `Plan depth: ${plan.depth}`, `Model tier: ${plan.tier}`];
  if (answers && Object.keys(answers).length > 0) {
    parts.push(`Answers: ${JSON.stringify(answers)}`);
  }
  return parts.join('\n');
}

export function callModelStdio(command: string, prompt: string, timeout = 120_000): string {
  const args = command.split(/\s+/);
  const result = execFileSync(args[0], args.slice(1), { input: prompt, timeout, encoding: 'utf8' });
  return result.trim();
}

export async function callModelApi(url: string, model: string, prompt: string, apiKey?: string, timeout = 120_000): Promise<string> {
  const body = JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } finally {
    clearTimeout(timer);
  }
}

export function callModel(config: ModelConfig, prompt: string): string {
  if (config.provider === 'stdio') {
    return callModelStdio(config.command ?? config.model, prompt);
  }
  return '';
}

export async function callModelAsync(config: ModelConfig, prompt: string): Promise<string> {
  if (config.provider === 'api') {
    return callModelApi(config.apiUrl ?? '', config.model, prompt, config.apiKey);
  }
  return callModel(config, prompt);
}

export async function orchestrate(
  task: string,
  type: TaskType,
  level: VerifiabilityLevel,
  plan: { depth: string; tier: string; steps: string[]; checks: string[] },
  target: string,
  kinds: OracleKind[],
  config: ModelConfig,
  answers?: Record<string, string>,
  maxRetries = 3,
): Promise<OrchestrateResult> {
  const prompt = assemblePrompt(task, type, level, plan, answers);
  let lastOutput = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const output = await callModelAsync(config, prompt + (attempt > 0 ? `\n\nPrevious attempt failed. Fix the issues and try again.` : ''));
    lastOutput = output;

    const verifyResult = verify(target, level, kinds);
    if (verifyResult.verdict === 'PASS') {
      return { output, verdict: 'PASS', retries: attempt };
    }
  }

  return { output: lastOutput, verdict: 'FAIL', retries: maxRetries };
}
