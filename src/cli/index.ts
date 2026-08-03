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
import { buildAgentInstruction, formatAgentInstructionJson } from '../util/agent-instruction.js';
import { VERSION } from './version.js';

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
  veridia verify --target <path> --type <type> --level <level>
                            Run a target's checks and print a verdict
  veridia measure --record <json> [--task <task> --type <type> --level <level> --verdict <verdict>]
                            Record a run outcome
  veridia measure --history  Print history summary
  veridia review [--target <path>]
                            Output code review instructions for an AI agent
  veridia agents --list     List all supported AI agents

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

if (arg === undefined || arg === '--help' || arg === '-h') {
  process.stdout.write(USAGE);
  process.exitCode = 0;
} else if (arg === 'version' || arg === '-v' || arg === '--version') {
  process.stdout.write(`${VERSION}\n`);
  process.exitCode = 0;
} else if (arg === 'classify') {
  let agentId = '';
  let taskStart = 1;
  if (args[1] === '--agent' && args[2]) {
    agentId = args[2];
    taskStart = 3;
  }
  const task = args.slice(taskStart).join(' ').trim();
  if (task === '') {
    process.stderr.write('veridia: classify requires a task string\n');
    process.exitCode = 1;
  } else if (agentId) {
    const agent = getAgent(agentId);
    const ai = buildAgentInstruction(
      'Classify the following task description into one of: bugfix, refactor, feature, doc, explore, open. Return the type and a confidence score.',
      { task },
      'JSON with type and confidence fields',
      agent ?? null,
    );
    process.stdout.write(formatAgentInstructionJson(ai) + '\n');
    process.exitCode = 0;
  } else {
    const result = classify(task);
    process.stdout.write(`${result.type}\t${result.confidence}\n`);
    process.exitCode = 0;
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
      const oracles = result.oracles.map((o) => o.kind).join(',');
      process.stdout.write(`${result.level}\t${oracles}\n`);
      process.exitCode = 0;
    }
  }
} else if (arg === 'route') {
  const flags = parseFlags(args.slice(1), ['--type', '--level', '--agent']);
  if (flags._error) {
    process.stderr.write(`veridia: route ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const agentId = flags['--agent'] ?? '';
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: route: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: route: ${levelErr}\n`); process.exitCode = 1; }
      else if (agentId) {
        const agent = getAgent(agentId);
        const ai = buildAgentInstruction(
          `Execute the following run plan for a ${type} task at verifiability level ${level}. Follow the plan steps and run the checks.`,
          { type, level, plan: buildPlan(type as TaskType, Number(level) as VerifiabilityLevel) },
          'Execution result with step outcomes and check results',
          agent ?? null,
        );
        process.stdout.write(formatAgentInstructionJson(ai) + '\n');
        process.exitCode = 0;
      } else {
        const plan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
        process.stdout.write(`${plan.depth}\t${plan.tier}\t${plan.trust}\tsteps=${plan.steps.join(',')}\tchecks=${plan.checks.join(',')}\n`);
        process.exitCode = 0;
      }
    }
  }
} else if (arg === 'ask') {
  const flags = parseFlags(args.slice(1), ['--type', '--level', '--agent']);
  if (flags._error) {
    process.stderr.write(`veridia: ask ${flags._error}\n`);
    process.exitCode = 1;
  } else {
    const type = flags['--type'] ?? '';
    const level = flags['--level'] ?? '';
    const agentId = flags['--agent'] ?? '';
    const typeErr = validateType(type);
    if (typeErr) { process.stderr.write(`veridia: ask: ${typeErr}\n`); process.exitCode = 1; }
    else {
      const levelErr = validateLevel(level);
      if (levelErr) { process.stderr.write(`veridia: ask: ${levelErr}\n`); process.exitCode = 1; }
      else if (agentId) {
        const agent = getAgent(agentId);
        const ai = buildAgentInstruction(
          `Generate 2-3 clarifying questions for a ${type} task at verifiability level ${level}. Questions should help understand scope, acceptance criteria, and constraints.`,
          { type, level },
          'Array of questions with id, prompt, and options fields',
          agent ?? null,
        );
        process.stdout.write(formatAgentInstructionJson(ai) + '\n');
        process.exitCode = 0;
      } else {
        const result = ask(type as TaskType, Number(level) as VerifiabilityLevel);
        if (result.questions.length === 0) {
          process.stdout.write('no clarifying questions needed\n');
        } else {
          for (const q of result.questions) {
            process.stdout.write(`${q.id}\t${q.prompt}\t${q.options.join('|')}\n`);
          }
        }
        process.exitCode = 0;
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
            for (const check of result.checks) {
              process.stdout.write(`${check.kind}\t${check.passed ? 'PASS' : 'FAIL'}\t${check.weak ? 'weak' : 'strong'}\t${check.command}\n`);
            }
            process.stdout.write(`verdict\t${result.verdict}\n`);
            process.exitCode = 0;
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
    } else {
      process.stderr.write(`veridia: unknown argument for measure: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  if (!invalid) {
    if (history) {
      const summary = measureHistory();
      process.stdout.write(`totalRuns\t${summary.totalRuns}\n`);
      for (const [v, n] of Object.entries(summary.perVerdict)) {
        process.stdout.write(`perVerdict\t${v}\t${n}\n`);
      }
      for (const [l, n] of Object.entries(summary.perLevel)) {
        process.stdout.write(`perLevel\t${l}\t${n}\n`);
      }
      for (const e of summary.recent) {
        process.stdout.write(`recent\t${e.timestamp}\t${e.task}\t${e.verdict}\n`);
      }
      process.exitCode = 0;
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
          measureRecord(entry);
          process.stdout.write('recorded\n');
          process.exitCode = 0;
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
      process.stdout.write(JSON.stringify(instructions, null, 2) + '\n');
      process.exitCode = 0;
    }
  }
} else if (arg === 'agents') {
  if (args[1] === '--list') {
    const agents = getAllAgents();
    process.stdout.write('id\tname\tconfigDir\tinvocation\n');
    for (const a of agents) {
      process.stdout.write(`${a.id}\t${a.name}\t${a.configDir}\t${formatInvocation(a, 'command')}\n`);
    }
    process.exitCode = 0;
  } else {
    process.stderr.write('veridia: agents requires --list\n');
    process.exitCode = 1;
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
      process.stdout.write(`type\t${result.type}\t${result.confidence}\n`);
      process.stdout.write(`level\t${result.level}\n`);
      process.stdout.write(`plan\t${result.plan}\n`);
      process.stdout.write(`questions\t${result.questions}\n`);
      process.stdout.write(`verdict\t${result.verdict}\n`);
      process.exitCode = 0;
    }
  }
}
