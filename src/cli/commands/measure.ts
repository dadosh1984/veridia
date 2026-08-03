import path from 'node:path';
import type { Verdict } from '../../verify/types.js';
import { measureRecord, measureHistory } from '../../measure/measure.js';
import { jsonOut } from '../shared.js';

export function handle(args: string[]): void {
  let record: string | undefined;
  let history = false;
  let task = '';
  let type = '';
  let level = '';
  let verdict = '';
  let measureTarget = '';
  let invalid = false;
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--record') {
      record = args[++i];
      if (record === undefined) {
        process.stderr.write('veridia: measure --record requires a JSON string\n');
        process.exitCode = 1;
        invalid = true;
        break;
      }
    } else if (args[i] === '--history') {
      history = true;
    } else if (args[i] === '--task') {
      task = args[++i];
    } else if (args[i] === '--type') {
      type = args[++i];
    } else if (args[i] === '--level') {
      level = args[++i];
    } else if (args[i] === '--verdict') {
      verdict = args[++i];
    } else if (args[i] === '--target') {
      measureTarget = args[++i];
    } else {
      process.stderr.write(`veridia: unknown argument for measure: ${args[i]}\n`);
      process.exitCode = 1;
      invalid = true;
      break;
    }
  }
  if (invalid) return;
  const deps = measureTarget ? { root: path.resolve(measureTarget) } : undefined;
  if (history) {
    const summary = measureHistory(deps);
    jsonOut(summary);
  } else if (record) {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(record);
    } catch {
      process.stderr.write('veridia: measure --record requires valid JSON\n');
      process.exitCode = 1;
      return;
    }
    const entry = {
      task: (parsed!.task as string) || task,
      type: (parsed!.type as string) || type,
      level: Number((parsed!.level as string) || level),
      verdict: (parsed!.verdict as Verdict) || (verdict as Verdict),
      checks: (parsed!.checks as { kind: string; passed: boolean }[]) || [],
      drift: (parsed!.drift as string) || '',
    };
    if (!entry.task || !entry.type || !entry.verdict) {
      process.stderr.write('veridia: measure --record requires task, type, and verdict\n');
      process.exitCode = 1;
      return;
    }
    measureRecord(entry, deps);
    jsonOut({ recorded: true });
  } else {
    process.stderr.write('veridia: measure requires --record or --history\n');
    process.exitCode = 1;
  }
}
