import path from 'node:path';
import { learn } from '../../measure/learn.js';
import { parseFlags } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const flags = parseFlags(args.slice(1), ['--target']);
  if (flags._error) {
    process.stderr.write(`veridia: learn ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
  const result = learn({ root: target });
  jsonOut(result);
}
