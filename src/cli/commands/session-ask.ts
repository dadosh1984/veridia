import { askInteractive } from '../../ask/ask.js'
import { readSession, writeSession } from '../../session/session.js'

export async function handle(): Promise<void> {
  const session = readSession()
  if (!session?.type || session.level === undefined) {
    process.stderr.write('veridia: session missing type or level. Run session-classify and session-assess first.\n')
    process.exitCode = 1
    return
  }
  if (session.level >= 2) {
    process.stdout.write('  No questions needed (level >= 2)\n')
    session.step = 'do'
    writeSession(session)
    process.stdout.write(`  step       do (next: session-do)\n`)
    return
  }
  const result = await askInteractive(session.type, session.level)
  if (result.answers && Object.keys(result.answers).length > 0) {
    session.answers = result.answers
  }
  session.step = 'do'
  writeSession(session)
  for (const [id, answer] of Object.entries(session.answers || {})) {
    process.stdout.write(`  answer     ${id}: ${answer}\n`)
  }
  process.stdout.write(`  step       do (next: session-do)\n`)
}
