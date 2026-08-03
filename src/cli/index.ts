#!/usr/bin/env node
import { classify } from '../classify/classify.js';
import { VERSION } from './version.js';

const USAGE = `veridia - model-agnostic quality through mechanics

Usage:
  veridia [--help] [-h]     Print usage information
  veridia version [-v]      Print the veridia version
  veridia classify <task>   Classify a task string

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
} else {
  process.stderr.write(`veridia: unknown argument: ${arg}\n\n${USAGE}`);
  process.exitCode = 1;
}
