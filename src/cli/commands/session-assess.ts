import fs from 'node:fs';
import path from 'node:path';
import { assess } from '../../assess/assess.js';
import { readSession, writeSession } from '../../session/session.js';

export function handle(args: string[]): void {
  const session = readSession();
  if (!session) {
    process.stderr.write('veridia: no active session. Run session-classify first.\n');
    process.exitCode = 1;
    return;
  }
  let target = process.cwd();
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: --target requires a path\n');
        process.exitCode = 1;
        return;
      }
    }
  }
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: target path does not exist: ${target}\n`);
    process.exitCode = 1;
    return;
  }
  const result = assess(resolved);
  session.level = result.level;
  session.step = 'route';
  writeSession(session);
  process.stdout.write(`  level      ${result.level}\n`);
  process.stdout.write(`  oracles    ${result.oracles.map((o) => o.kind).join(', ')}\n`);
  process.stdout.write(`  step       route (next: session-route)\n`);
}
