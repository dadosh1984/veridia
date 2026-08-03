import fs from 'node:fs';
import path from 'node:path';
import { buildReviewInstructions } from '../../review/review.js';
import { parseFlags } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const flags = parseFlags(args.slice(1), ['--target']);
  if (flags._error) {
    process.stderr.write(`veridia: review ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: review: target path does not exist: ${target}\n`);
    process.exitCode = 1;
    return;
  }
  const instructions = buildReviewInstructions(target);
  jsonOut(instructions);
}
