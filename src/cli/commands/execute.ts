import path from 'node:path';
import type { TaskType } from '../../classify/types.js';
import type { VerifiabilityLevel } from '../../assess/types.js';
import { buildPlan } from '../../route/route.js';
import { buildExecutionPlan } from '../../execute/plan.js';
import { delegate } from '../../execute/delegate.js';
import { parseFlags, validateType, validateLevel } from '../shared.js';
import { jsonOut } from '../shared.js';

export async function handle(args: string[]): Promise<void> {
  const flags = parseFlags(args.slice(1), ['--type', '--level', '--files', '--target']);
  if (flags._error) {
    process.stderr.write(`veridia: execute ${flags._error}\n`);
    process.exitCode = 1;
    return;
  }
  const type = flags['--type'] ?? '';
  const level = flags['--level'] ?? '';
  const filesStr = flags['--files'] ?? '';
  const target = flags['--target'] ? path.resolve(flags['--target']) : process.cwd();
  const typeErr = validateType(type);
  if (typeErr) { process.stderr.write(`veridia: execute: ${typeErr}\n`); process.exitCode = 1; return; }
  const levelErr = validateLevel(level);
  if (levelErr) { process.stderr.write(`veridia: execute: ${levelErr}\n`); process.exitCode = 1; return; }
  const files = filesStr ? filesStr.split(',').map((f) => f.trim()).filter(Boolean) : undefined;
  const runPlan = buildPlan(type as TaskType, Number(level) as VerifiabilityLevel);
  const execPlan = buildExecutionPlan('', type as TaskType, Number(level) as VerifiabilityLevel, runPlan, files, target);
  const result = await delegate(execPlan, target);
  jsonOut({ exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr });
}
