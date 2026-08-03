import fs from 'node:fs';
import path from 'node:path';
import { assess } from '../../assess/assess.js';
import { parseFlags } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const flags = parseFlags(args.slice(1), ['--target', '--type']);
  if (flags._error) {
    process.stderr.write(`veridia: assess ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: assess: target path does not exist: ${flags['--target']}\n`);
    process.exitCode = 1;
    return;
  }
  const result = assess(target, undefined, flags['--type']);
  jsonOut({ level: result.level, oracles: result.oracles.map((o) => o.kind) });
}
