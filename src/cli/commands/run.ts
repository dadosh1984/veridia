import fs from 'node:fs';
import path from 'node:path';
import { triage } from '../../triage/triage.js';
import { jsonOut } from '../shared.js';

export async function handle(args: string[]): Promise<void> {
  let task = '';
  let target = process.cwd();
  let auto = false;
  let ww = false;
  let changeName = '';
  let self = false;

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--target') {
      target = args[++i];
      if (target === undefined) {
        process.stderr.write('veridia: --target requires a path\n');
        process.exitCode = 1;
        return;
      }
    } else if (a === '--auto' || a === '--non-interactive' || a === '--yes') {
      auto = true;
    } else if (a === '--ww') {
      ww = true;
    } else if (a === '--change') {
      changeName = args[++i];
      if (changeName === undefined) {
        process.stderr.write('veridia: --change requires a name\n');
        process.exitCode = 1;
        return;
      }
    } else if (a === '--self') {
      self = true;
    } else {
      task = args.slice(i).join(' ').trim();
      break;
    }
  }

  if (!task) {
    process.stderr.write('veridia: run requires a task description\n');
    process.exitCode = 1;
    return;
  }

  if (self) {
    target = process.cwd();
  }

  if (ww && changeName) {
    const changeDir = path.resolve(target, 'warpweave', 'changes', changeName);
    if (fs.existsSync(changeDir)) {
      target = changeDir;
    }
  }

  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: target path does not exist: ${target}\n`);
    process.exitCode = 1;
    return;
  }

  const result = await triage(task, resolved, { auto });

  process.stdout.write(`\n`);
  process.stdout.write(`  type       ${result.type.padEnd(12)} ${result.confidence.toFixed(2)}\n`);
  process.stdout.write(`  level      ${result.level}\n`);
  process.stdout.write(`  plan       ${result.plan.depth.padEnd(12)} ${result.plan.tier}\n`);
  if (result.questions.length > 0) {
    process.stdout.write(`  questions  ${result.questions.length}\n`);
  }
  if (result.answers && Object.keys(result.answers).length > 0) {
    for (const [id, answer] of Object.entries(result.answers)) {
      process.stdout.write(`  answer     ${id}: ${answer}\n`);
    }
  }
  process.stdout.write(`  verdict    ${result.verdict}\n`);
  process.stdout.write(`\n`);
}
