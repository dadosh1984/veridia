import { classify } from '../../classify/classify.js';
import { readSession, writeSession } from '../../session/session.js';
import type { Session } from '../../session/types.js';

export function handle(args: string[]): void {
  const task = args.slice(1).join(' ').trim();
  const existing = readSession();
  const taskStr = task || existing?.task || '';
  if (!taskStr) {
    process.stderr.write('veridia: session-classify requires a task string or an active session\n');
    process.exitCode = 1;
    return;
  }
  const result = classify(taskStr);
  const session: Session = {
    task: taskStr,
    type: result.type,
    confidence: result.confidence,
    step: 'assess',
  };
  writeSession(session);
  process.stdout.write(`  type       ${result.type.padEnd(12)} ${result.confidence.toFixed(2)}\n`);
  process.stdout.write(`  step       assess (next: session-assess)\n`);
}
