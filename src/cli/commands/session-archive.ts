import { readSession, clearSession } from '../../session/session.js';
import { measureRecord } from '../../measure/measure.js';

export function handle(_args: string[]): void {
  const session = readSession();
  if (!session) {
    process.stdout.write('  No active session to archive.\n');
    return;
  }
  if (session.step !== 'done') {
    process.stdout.write(`  Session is not complete (step: ${session.step}). Run session-do first.\n`);
    process.exitCode = 1;
    return;
  }
  measureRecord({
    task: session.task,
    type: session.type || 'unknown',
    level: session.level ?? 0,
    verdict: session.verdict || 'HUMAN',
    checks: [],
    drift: '0',
  });
  clearSession();
  process.stdout.write('  Session archived to history.\n');
}
