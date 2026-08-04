import { buildPlan } from '../../route/route.js'
import { readSession, writeSession } from '../../session/session.js'

export function handle(): void {
  const session = readSession()
  if (!session?.type || session.level === undefined) {
    process.stderr.write('veridia: session missing type or level. Run session-classify and session-assess first.\n')
    process.exitCode = 1
    return
  }
  const plan = buildPlan(session.type, session.level)
  session.plan = {
    depth: plan.depth,
    tier: plan.tier,
    steps: plan.steps,
    checks: plan.checks,
  }
  session.step = 'ask'
  writeSession(session)
  process.stdout.write(`  plan       ${plan.depth.padEnd(16)} ${plan.tier}\n`)
  process.stdout.write(`  step       ask (next: session-ask)\n`)
}
