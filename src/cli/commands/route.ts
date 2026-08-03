import type { TaskType } from '../../classify/types.js';
import type { VerifiabilityLevel } from '../../assess/types.js';
import { buildPlan } from '../../route/route.js';
import { parseFlags, validateType, validateLevel } from '../shared.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  const flags = parseFlags(args.slice(1), ['--type', '--level']);
  if (flags._error) {
    process.stderr.write(`veridia: route ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const type = flags['--type'] ?? '';
  const level = flags['--level'] ?? '';
  const typeErr = validateType(type);
  if (typeErr) { process.stderr.write(`veridia: route: ${typeErr}\n`); process.exitCode = 1; return; }
  const levelErr = validateLevel(level);
  if (levelErr) { process.stderr.write(`veridia: route: ${levelErr}\n`); process.exitCode = 1; return; }
  const plan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
  jsonOut({ depth: plan.depth, tier: plan.tier, trust: plan.trust, steps: plan.steps, checks: plan.checks });
}
