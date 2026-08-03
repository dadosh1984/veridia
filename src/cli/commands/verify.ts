import fs from 'node:fs';
import path from 'node:path';
import type { TaskType } from '../../classify/types.js';
import type { VerifiabilityLevel } from '../../assess/types.js';
import { probeOracles, realFs } from '../../assess/probe.js';
import { verify } from '../../verify/verify.js';
import { parseFlags, validateType, validateLevel } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const dryRun = args.includes('--dry-run');
  const filteredArgs = args.filter((a) => a !== '--dry-run');
  const flags = parseFlags(filteredArgs.slice(1), ['--target', '--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: verify ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const target = flags['--target'] ?? '';
  const type = flags['--type'] ?? '';
  const level = flags['--level'] ?? '';
  if (target === '') { process.stderr.write('veridia: verify: missing --target\n'); process.exitCode = 1; return; }
  const typeErr = validateType(type);
  if (typeErr) { process.stderr.write(`veridia: verify: ${typeErr}\n`); process.exitCode = 1; return; }
  const levelErr = validateLevel(level);
  if (levelErr) { process.stderr.write(`veridia: verify: ${levelErr}\n`); process.exitCode = 1; return; }
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: verify: target path does not exist: ${target}\n`);
    process.exitCode = 1;
    return;
  }
  const kinds = probeOracles(resolved, realFs).map((o) => o.kind);
  const result = verify(resolved, Number(level) as VerifiabilityLevel, kinds, { dryRun });
  jsonOut({ checks: result.checks, verdict: result.verdict });
}
