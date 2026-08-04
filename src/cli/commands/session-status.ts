import { readSession } from '../../session/session.js';

const NEXT_STEP: Record<string, string> = {
  classify: 'session-classify <task>',
  assess: 'session-assess [--target <path>]',
  route: 'session-route',
  ask: 'session-ask',
  do: 'session-do',
  done: 'session-archive',
};

export function handle(_args: string[]): void {
  const session = readSession();
  if (!session) {
    process.stdout.write('  No active session. Start with: session-classify <task>\n');
    return;
  }
  process.stdout.write(`  task       ${session.task}\n`);
  if (session.type) process.stdout.write(`  type       ${session.type.padEnd(12)} ${session.confidence?.toFixed(2) ?? ''}\n`);
  if (session.level !== undefined) process.stdout.write(`  level      ${session.level}\n`);
  if (session.plan) process.stdout.write(`  plan       ${session.plan.depth.padEnd(16)} ${session.plan.tier}\n`);
  if (session.answers && Object.keys(session.answers).length > 0) {
    for (const [id, answer] of Object.entries(session.answers)) {
      process.stdout.write(`  answer     ${id}: ${answer}\n`);
    }
  }
  if (session.verdict) process.stdout.write(`  verdict    ${session.verdict}\n`);
  process.stdout.write(`  step       ${session.step}\n`);
  process.stdout.write(`  next       ${NEXT_STEP[session.step]}\n`);
}
