import { verify } from '../../verify/verify.js';
import { measureRecord } from '../../measure/measure.js';
import { readSession, writeSession } from '../../session/session.js';
import type { OracleKind } from '../../assess/types.js';

export function handle(_args: string[]): void {
  const session = readSession();
  if (!session || !session.type || session.level === undefined || !session.plan) {
    process.stderr.write('veridia: incomplete session. Run session-classify, session-assess, session-route first.\n');
    process.exitCode = 1;
    return;
  }
  const target = process.cwd();
  const validKinds = new Set<OracleKind>(['test-runner', 'type-check', 'lint', 'ci', 'test-content']);
  const kinds: OracleKind[] = session.plan.checks.filter((c): c is OracleKind => validKinds.has(c as OracleKind));
  const verifyResult = verify(target, session.level, kinds);
  session.verdict = verifyResult.verdict;
  session.step = 'done';
  writeSession(session);

  measureRecord({
    task: session.task,
    type: session.type,
    level: session.level,
    verdict: verifyResult.verdict,
    checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
    drift: '0',
  });

  process.stdout.write(`  verdict    ${verifyResult.verdict}\n`);
  process.stdout.write(`  step       done (next: session-archive)\n`);
}
