import { execFileSync } from 'node:child_process';
import { splitCommand } from '../util/split-command.js';
import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import type { Verdict } from '../verify/types.js';
import { verify } from '../verify/verify.js';
import type { OracleKind } from '../assess/types.js';
import { readHistory } from '../measure/history.js';
import { computePrecision } from '../measure/learn.js';
import { loadConfig } from '../config/config.js';

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
  const args = splitCommand(command);
  const result = execFileSync(args[0], args.slice(1), { input: prompt, timeout, encoding: 'utf8' });
  return result.trim();
}

export async function callModelApi(url: string, model: string, prompt: string, apiKey?: string, timeout = 120_000): Promise<string> {
  if (!url) throw new Error('model API URL is required — set apiUrl in config or VERIDIA_API_URL env');
  const body = JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    let response: Response;
    try {
      response = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });
    } catch (err) {
      throw new Error(`model API request failed: ${(err as Error).message}`, { cause: err });
    }
    if (!response.ok) {
      throw new Error(`model API returned HTTP ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    let data: { choices?: { message?: { content?: string } }[] } = {};
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      throw new Error('model API returned a non-JSON response');
    }
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  } finally {
    clearTimeout(timer);
  }
}

export async function callModelAsync(config: ModelConfig, prompt: string): Promise<string> {
  if (config.provider === 'api') {
    return callModelApi(config.apiUrl ?? '', config.model, prompt, config.apiKey);
  }
  return callModelStdio(config.command ?? config.model, prompt);
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
    let output: string;
    try {
      const feedback = attempt > 0 ? `\n\nPrevious attempt failed. Fix the issues and try again.\n${lastOutput}` : '';
      output = await callModelAsync(config, prompt + feedback);
    } catch (err) {
      lastOutput = `model call failed: ${(err as Error).message}`;
      continue;
    }
    lastOutput = output;

    const precision = computePrecision(readHistory({ root: target }));
    const weights = loadConfig(target).weights;
    const verifyResult = verify(target, level, kinds, { precision, weights });
    if (verifyResult.verdict === 'PASS') {
      return { output, verdict: 'PASS', retries: attempt };
    }
  }

  return { output: lastOutput, verdict: 'FAIL', retries: maxRetries };
}
