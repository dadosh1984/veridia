import { readSession, clearSession } from '../../session/session.js'

export function handle(): void {
  const session = readSession()
  if (!session) {
    process.stdout.write('  No active session to archive.\n')
    return
  }
  if (session.step !== 'done') {
    process.stdout.write(`  Session is not complete (step: ${session.step}). Run session-do first.\n`)
    process.exitCode = 1
    return
  }
  clearSession()
  process.stdout.write('  Session archived to history.\n')
}
