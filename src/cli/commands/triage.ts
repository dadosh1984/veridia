import fs from 'node:fs';
import path from 'node:path';
import { triage } from '../../triage/triage.js';
import { jsonOut } from '../shared.js';

export async function handle(args: string[]): Promise<void> {
  let task = args[0];
  let target = process.cwd();
  let auto = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: --target requires a path\n');
        process.exitCode = 1;
        return;
      }
    } else if (args[i] === '--auto' || args[i] === '--non-interactive' || args[i] === '--yes') {
      auto = true;
    } else {
      task = args.slice(i).join(' ').trim();
      break;
    }
  }
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: target path does not exist: ${target}\n`);
    process.exitCode = 1;
    return;
  }
  const result = await triage(task, resolved, { auto });
  jsonOut(result);
}
