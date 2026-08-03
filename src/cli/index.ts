#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { assess } from '../assess/assess.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import { classify } from '../classify/classify.js';
import type { TaskType } from '../classify/types.js';
import { buildPlan } from '../route/route.js';
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
} else {
  process.stderr.write(`veridia: unknown argument: ${arg}\n\n${USAGE}`);
  process.exitCode = 1;
}
