import type { TaskType } from '../../classify/types.js';
import type { VerifiabilityLevel } from '../../assess/types.js';
import { ask } from '../../ask/ask.js';
import { parseFlags, validateType, validateLevel } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const flags = parseFlags(args.slice(1), ['--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: ask ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const type = flags['--type'] ?? '';
  const level = flags['--level'] ?? '';
  const typeErr = validateType(type);
  if (typeErr) { process.stderr.write(`veridia: ask: ${typeErr}\n`); process.exitCode = 1; return; }
  const levelErr = validateLevel(level);
  if (levelErr) { process.stderr.write(`veridia: ask: ${levelErr}\n`); process.exitCode = 1; return; }
  const result = ask(type as TaskType, Number(level) as VerifiabilityLevel);
  jsonOut({ questions: result.questions });
}
