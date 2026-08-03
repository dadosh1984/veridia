#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { ask } from '../ask/ask.js';
import { assess } from '../assess/assess.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import { classify } from '../classify/classify.js';
import type { TaskType } from '../classify/types.js';
import { buildPlan } from '../route/route.js';
import { probeOracles, realFs } from '../assess/probe.js';
import { verify } from '../verify/verify.js';
import type { Verdict } from '../verify/types.js';
import { measureRecord, measureHistory } from '../measure/measure.js';
import { triage } from '../triage/triage.js';
import { buildReviewInstructions } from '../review/review.js';
import { getAllAgents, getAgent, formatInvocation } from '../agent/agents.js';
import { loadConfig, DEFAULT_CONFIG } from '../config/config.js';
import { generateCommands } from '../generate/generate.js';
import { VERSION } from './version.js';
import { buildExecutionPlan } from '../execute/plan.js';
import { delegate } from '../execute/delegate.js';

const USAGE = `veridia - model-agnostic quality through mechanics

Usage:
  veridia [--help] [-h]     Print usage information
  veridia version [-v]      Print the veridia version
  veridia <task>            Run the full triage loop on a task string
  veridia classify <task>   Classify a task string
  veridia assess [--target <path>] [--type <type>]
                            Assess verifiability of a target
  veridia route --type <type> --level <level>
                            Route (type, level) to a run plan
  veridia ask --type <type> --level <level>
                            Ask clarifying questions (levels 0/1)
  veridia plan --type <type> --level <level> [--files <files>] [--target <path>]
                            Generate an execution plan for the host agent
  veridia execute --type <type> --level <level> [--files <files>] [--target <path>]
                            Execute a plan via the host agent
  veridia verify --target <path> --type <type> --level <level>
                            Run a target's checks and print a verdict
  veridia measure --record <json> [--task <task> --type <type> --level <level> --verdict <verdict>]
                            Record a run outcome
  veridia measure --history  Print history summary
  veridia review [--target <path>]
                            Output code review instructions for an AI agent
  veridia agents --list     List all supported AI agents
  veridia init --agent <name>
                            Initialize veridia config and agent command files
  veridia generate --agent <name>
                            Generate agent command files

Options:
  -h, --help     Show this help message and exit
  -v, --version  Print the version and exit
`;

const args = process.argv.slice(2);
const arg = args[0];

const VALID_TYPES = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'] as const;
const VALID_LEVELS = ['0', '1', '2', '3'] as const;

function parseFlags(flags: string[], expected: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < flags.length; i++) {
    const f = flags[i];
    if (expected.includes(f)) {
      result[f] = flags[++i];
      if (result[f] === undefined) return result;
    } else {
      result._error = `unknown argument: ${f}`;
      return result;
    }
  }
  return result;
}

function validateType(v: string): string | undefined {
  return VALID_TYPES.includes(v as typeof VALID_TYPES[number]) ? undefined : `invalid task type: ${v}`;
}

function validateLevel(v: string): string | undefined {
  return VALID_LEVELS.includes(v as typeof VALID_LEVELS[number]) ? undefined : `invalid verifiability level: ${v}`;
}

function jsonOut(data: unknown): void {
  process.stdout.write(JSON.stringify(data) + '\n');
}

if (arg === undefined || arg === '--help' || arg === '-h') {
  process.stdout.write(USAGE);
  process.exitCode = 0;
} else if (arg === 'version' || arg === '-v' || arg === '--version') {
  jsonOut({ version: VERSION });
} else if (arg === 'classify') {
  const task = args.slice(1).join(' ').trim();
  if (task === '') {
    process.stderr.write('veridia: classify requires a task string\n');
    process.exitCode = 1;
  } else {
    const result = classify(task);
    jsonOut({ type: result.type, confidence: result.confidence });
  }
} else if (arg === 'assess') {
  const flags = parseFlags(args.slice(1), ['--target', '--type']);
  if (flags._error) {
    process.stderr.write(`veridia: assess ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
    if (!fs.existsSync(target)) {
      process.stderr.write(`veridia: assess: target path does not exist: ${flags['--target']}\n`);
      process.exitCode = 1;
    } else {
      const result = assess(target, undefined, flags['--type']);
      jsonOut({ level: result.level, oracles: result.oracles.map((o) => o.kind) });
    }
  }
} else if (arg === 'route') {
  const flags = parseFlags(args.slice(1), ['--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: route ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: route: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: route: ${levelErr}\n`); process.exitCode = 1; }
      else {
        const plan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
        jsonOut({ depth: plan.depth, tier: plan.tier, trust: plan.trust, steps: plan.steps, checks: plan.checks });
      }
    }
  }
} else if (arg === 'ask') {
  const flags = parseFlags(args.slice(1), ['--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: ask ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: ask: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: ask: ${levelErr}\n`); process.exitCode = 1; }
      else {
        const result = ask(type as TaskType, Number(level) as VerifiabilityLevel);
        jsonOut({ questions: result.questions });
      }
    }
  }
} else if (arg === 'plan') {
  const flags = parseFlags(args.slice(1), ['--type', '--level', '--files', '--target']);
  if (flags._error) {
    process.stderr.write(`veridia: plan ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const filesStr = flags['--files'] ?? '';
    const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: plan: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: plan: ${levelErr}\n`); process.exitCode = 1; }
      else {
        const files = filesStr ? filesStr.split(',').map((f) => f.trim()).filter(Boolean) : undefined;
        const runPlan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
        const execPlan = buildExecutionPlan('', type as TaskType, Number(level) as VerifiabilityLevel, runPlan, files, target);
        jsonOut(execPlan);
      }
    }
  }
} else if (arg === 'execute') {
  const flags = parseFlags(args.slice(1), ['--type', '--level', '--files', '--target']);
  if (flags._error) {
    process.stderr.write(`veridia: execute ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const filesStr = flags['--files'] ?? '';
    const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: execute: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: execute: ${levelErr}\n`); process.exitCode = 1; }
      else {
        const files = filesStr ? filesStr.split(',').map((f) => f.trim()).filter(Boolean) : undefined;
        const runPlan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
        const execPlan = buildExecutionPlan('', type as TaskType, Number(level) as VerifiabilityLevel, runPlan, files, target);
        const result = delegate(execPlan, target);
        jsonOut({ exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr });
      }
    }
  }
} else if (arg === 'verify') {
  const flags = parseFlags(args.slice(1), ['--target', '--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: verify ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const target = flags['--target'] ?? '';
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    if (target === '') { process.stderr.write('veridia: verify: missing --target\n'); process.exitCode = 1; }
    else {
      const typeErr = validateType(type);
      if (typeErr) { process.stderr.write(`veridia: verify: ${typeErr}\n`); process.exitCode = 1; }
      else {
        const levelErr = validateLevel(level);
        if (levelErr) { process.stderr.write(`veridia: verify: ${levelErr}\n`); process.exitCode = 1; }
        else {
          const resolved = path.resolve(target);
          if (!fs.existsSync(resolved)) {
            process.stderr.write(`veridia: verify: target path does not exist: ${target}\n`);
            process.exitCode = 1;
          } else {
            const kinds = probeOracles(resolved, realFs).map((o) => o.kind);
            const result = verify(resolved, Number(level) as VerifiabilityLevel, kinds);
            jsonOut({ checks: result.checks, verdict: result.verdict });
          }
        }
      }
    }
  }
} else if (arg === 'measure') {
  let record: string | undefined;
  let history = false;
  let task = '';
  let type = '';
  let level = '';
  let verdict = '';
  let measureTarget = '';
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--record') {
      record = args[++i];
      if (record === undefined) {
        process.stderr.write('veridia: measure --record requires a JSON string\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--history') {
      history = true;
    } else if (args[i] === '--task') {
      task = args[++i];
    } else if (args[i] === '--type') {
      type = args[++i];
    } else if (args[i] === '--level') {
      level = args[++i];
    } else if (args[i] === '--verdict') {
      verdict = args[++i];
    } else if (args[i] === '--target') {
      measureTarget = args[++i];
    } else {
      process.stderr.write(`veridia: unknown argument for measure: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  if (!invalid) {
    const deps = measureTarget ? { root: path.resolve(measureTarget) } : undefined;
    if (history) {
      const summary = measureHistory(deps);
      jsonOut(summary);
    } else if (record) {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(record);
      } catch {
        process.stderr.write('veridia: measure --record requires valid JSON\n');
        process.exitCode = 1;
        invalid = true;
      }
      if (!invalid) {
        const entry = {
          task: (parsed!.task as string) || task,
          type: (parsed!.type as string) || type,
          level: Number((parsed!.level as string) || level),
          verdict: (parsed!.verdict as Verdict) || (verdict as Verdict),
          checks: (parsed!.checks as { kind: string; passed: boolean }[]) || [],
          drift: (parsed!.drift as string) || '',
        };
        if (!entry.task || !entry.type || !entry.verdict) {
          process.stderr.write('veridia: measure --record requires task, type, and verdict\n');
          process.exitCode = 1;
        } else {
          measureRecord(entry, deps);
          jsonOut({ recorded: true });
        }
      }
    } else {
      process.stderr.write('veridia: measure requires --record or --history\n');
      process.exitCode = 1;
    }
  }
} else if (arg === 'review') {
  const flags = parseFlags(args.slice(1), ['--target']);
  if (flags._error) {
    process.stderr.write(`veridia: review ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
    if (!fs.existsSync(target)) {
      process.stderr.write(`veridia: review: target path does not exist: ${target}\n`);
      process.exitCode = 1;
    } else {
      const instructions = buildReviewInstructions(target);
      jsonOut(instructions);
    }
  }
} else if (arg === 'agents') {
  if (args[1] === '--list') {
    const agents = getAllAgents();
    jsonOut({ agents: agents.map((a) => ({ id: a.id, name: a.name, configDir: a.configDir, invocation: formatInvocation(a, 'command') })) });
  } else {
    process.stderr.write('veridia: agents requires --list\n');
    process.exitCode = 1;
  }
} else if (arg === 'init') {
  const agentIdx = args.indexOf('--agent');
  const agentId = agentIdx >= 0 && args[agentIdx + 1] ? args[agentIdx + 1] : '';
  if (!agentId) {
    process.stderr.write('veridia: init requires --agent <name>\n');
    process.exitCode = 1;
  } else {
    const agent = getAgent(agentId);
    if (!agent) {
      process.stderr.write(`veridia: init: unknown agent: ${agentId}\n`);
      process.exitCode = 1;
    } else {
      const target = process.cwd();
      const configDir = path.join(target, '.veridia');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      const configPath = path.join(configDir, 'config.json');
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8');
      }
      const generated = generateCommands(agent, target);
      jsonOut({ initialized: true, agent: agentId, configFile: '.veridia/config.json', commandsGenerated: generated });
    }
  }
} else if (arg === 'generate') {
  const agentIdx = args.indexOf('--agent');
  const agentId = agentIdx >= 0 && args[agentIdx + 1] ? args[agentIdx + 1] : '';
  if (!agentId) {
    process.stderr.write('veridia: generate requires --agent <name>\n');
    process.exitCode = 1;
  } else {
    const agent = getAgent(agentId);
    if (!agent) {
      process.stderr.write(`veridia: generate: unknown agent: ${agentId}\n`);
      process.exitCode = 1;
    } else {
      const target = process.cwd();
      const generated = generateCommands(agent, target);
      jsonOut({ generated: true, agent: agentId, commandsGenerated: generated });
    }
  }
} else if (arg.startsWith('--')) {
  process.stderr.write(`veridia: unknown argument: ${arg}\n\n${USAGE}`);
  process.exitCode = 1;
} else {
  let task = arg;
  let target = process.cwd();
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: --target requires a path\n');
        process.exitCode = 1;
        break;
      }
    } else {
      task = args.slice(i).join(' ').trim();
      break;
    }
  }
  if (process.exitCode !== 1) {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      process.stderr.write(`veridia: target path does not exist: ${target}\n`);
      process.exitCode = 1;
    } else {
      const result = triage(task, resolved);
      jsonOut(result);
    }
  }
}
