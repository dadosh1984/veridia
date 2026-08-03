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
import { VERSION } from './version.js';

const USAGE = `veridia - model-agnostic quality through mechanics

Usage:
  veridia [--help] [-h]     Print usage information
  veridia version [-v]      Print the veridia version
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

Options:
  -h, --help     Show this help message and exit
  -v, --version  Print the version and exit
`;

const args = process.argv.slice(2);
const arg = args[0];

if (arg === undefined || arg === '--help' || arg === '-h') {
  process.stdout.write(USAGE);
  process.exitCode = 0;
} else if (arg === 'version' || arg === '-v' || arg === '--version') {
  process.stdout.write(`${VERSION}\n`);
  process.exitCode = 0;
} else if (arg === 'classify') {
  const task = args.slice(1).join(' ').trim();
  if (task === '') {
    process.stderr.write('veridia: classify requires a task string\n');
    process.exitCode = 1;
  } else {
    const result = classify(task);
    process.stdout.write(`${result.type}\t${result.confidence}\n`);
    process.exitCode = 0;
  }
} else if (arg === 'assess') {
  let target = process.cwd();
  let taskHint: string | undefined;
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: assess --target requires a path\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--type') {
      taskHint = args[++i];
      if (taskHint === undefined) {
        process.stderr.write('veridia: assess --type requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else {
      process.stderr.write(`veridia: unknown argument for assess: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  if (!invalid) {
    const resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      process.stderr.write(`veridia: assess: target path does not exist: ${target}\n`);
      process.exitCode = 1;
    } else {
      const result = assess(resolved, undefined, taskHint);
      const oracles = result.oracles.map((o) => o.kind).join(',');
      process.stdout.write(`${result.level}\t${oracles}\n`);
      process.exitCode = 0;
    }
  }
} else if (arg === 'route') {
  let type = '';
  let level = '';
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--type') {
      type = args[++i];
      if (type === undefined) {
        process.stderr.write('veridia: route --type requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--level') {
      level = args[++i];
      if (level === undefined) {
        process.stderr.write('veridia: route --level requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else {
      process.stderr.write(`veridia: unknown argument for route: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  const validTypes = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'];
  const validLevels = ['0', '1', '2', '3'];
  if (!invalid) {
    if (!validTypes.includes(type)) {
      process.stderr.write(`veridia: route: invalid task type: ${type}\n`);
      process.exitCode = 1;
      invalid = true;
    } else if (!validLevels.includes(level)) {
      process.stderr.write(`veridia: route: invalid verifiability level: ${level}\n`);
      process.exitCode = 1;
      invalid = true;
    }
  }
  if (!invalid) {
    const plan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
    process.stdout.write(
      `${plan.depth}\t${plan.tier}\t${plan.trust}\tsteps=${plan.steps.join(',')}\tchecks=${plan.checks.join(',')}\n`,
    );
    process.exitCode = 0;
  }
} else if (arg === 'ask') {
  let type = '';
  let level = '';
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--type') {
      type = args[++i];
      if (type === undefined) {
        process.stderr.write('veridia: ask --type requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--level') {
      level = args[++i];
      if (level === undefined) {
        process.stderr.write('veridia: ask --level requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else {
      process.stderr.write(`veridia: unknown argument for ask: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  const validTypes = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'];
  const validLevels = ['0', '1', '2', '3'];
  if (!invalid) {
    if (!validTypes.includes(type)) {
      process.stderr.write(`veridia: ask: invalid task type: ${type}\n`);
      process.exitCode = 1;
      invalid = true;
    } else if (!validLevels.includes(level)) {
      process.stderr.write(`veridia: ask: invalid verifiability level: ${level}\n`);
      process.exitCode = 1;
      invalid = true;
    }
  }
  if (!invalid) {
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
} else if (arg === 'verify') {
  let target = '';
  let type = '';
  let level = '';
  let resolved = '';
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: verify --target requires a path\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--type') {
      type = args[++i];
      if (type === undefined) {
        process.stderr.write('veridia: verify --type requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--level') {
      level = args[++i];
      if (level === undefined) {
        process.stderr.write('veridia: verify --level requires a value\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else {
      process.stderr.write(`veridia: unknown argument for verify: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  const validTypes = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'];
  const validLevels = ['0', '1', '2', '3'];
  if (!invalid) {
    if (target === '') {
      process.stderr.write('veridia: verify: missing --target\n');
      process.exitCode = 1;
      invalid = true;
    } else if (!validTypes.includes(type)) {
      process.stderr.write(`veridia: verify: invalid task type: ${type}\n`);
      process.exitCode = 1;
      invalid = true;
    } else if (!validLevels.includes(level)) {
      process.stderr.write(`veridia: verify: invalid verifiability level: ${level}\n`);
      process.exitCode = 1;
      invalid = true;
    }
  }
  if (!invalid) {
    resolved = path.resolve(target);
    if (!fs.existsSync(resolved)) {
      process.stderr.write(`veridia: verify: target path does not exist: ${target}\n`);
      process.exitCode = 1;
      invalid = true;
    }
  }
  if (!invalid) {
    const kinds = probeOracles(resolved, realFs).map((o) => o.kind);
    const result = verify(resolved, Number(level) as VerifiabilityLevel, kinds);
    for (const check of result.checks) {
      process.stdout.write(
        `${check.kind}\t${check.passed ? 'PASS' : 'FAIL'}\t${check.weak ? 'weak' : 'strong'}\t${check.command}\n`,
      );
    }
    process.stdout.write(`verdict\t${result.verdict}\n`);
    process.exitCode = 0;
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
} else {
  process.stderr.write(`veridia: unknown argument: ${arg}\n\n${USAGE}`);
  process.exitCode = 1;
}
