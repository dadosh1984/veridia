import type { OracleKind } from '../../assess/types.js'
import { log as vlog } from '../../util/log.js'
import { measureRecord } from '../../measure/measure.js'
import { readSession, writeSession } from '../../session/session.js'
import { verify } from '../../verify/verify.js'

const CHECK_TO_KIND: Record<string, OracleKind> = {
  'run-tests': 'test-runner',
  'type-check': 'type-check',
  'human-review': 'human-review',
  'test-runner': 'test-runner',
  lint: 'lint',
  ci: 'ci',
  'test-content': 'test-content',
}

export function handle(): void {
  const session = readSession()
  if (!session?.type || session.level === undefined || !session.plan) {
    vlog.error('incomplete session. Run session-classify, session-assess, session-route first.')
    process.exitCode = 1
    return
  }
  const target = process.cwd()
  const kinds: OracleKind[] = session.plan.checks.map((c) => CHECK_TO_KIND[c] ?? null).filter((k): k is OracleKind => k !== null)
  const verifyResult = verify(target, session.level, kinds)
  session.verdict = verifyResult.verdict
  session.step = 'done'
  writeSession(session)

  measureRecord({
    task: session.task,
    type: session.type,
    level: session.level,
    verdict: verifyResult.verdict,
    checks: verifyResult.checks.map((c) => ({ kind: c.kind, passed: c.passed })),
    drift: '0',
  })

  process.stdout.write(`  verdict    ${verifyResult.verdict}\n`)
  process.stdout.write(`  step       done (next: session-archive)\n`)
}
