import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Session } from './types.js'

function sessionDir(root: string): string {
  return join(root, '.veridia')
}

function sessionFile(root: string): string {
  return join(sessionDir(root), 'session.json')
}

/**
 * Read the current session state from .veridia/session.json.
 *
 * @param root - The project root directory (defaults to process.cwd()).
 * @returns The Session object, or null if no session file exists or it is invalid.
 */
export function readSession(root: string = process.cwd()): Session | null {
  const file = sessionFile(root)
  if (!existsSync(file)) return null
  try {
    const raw = readFileSync(file, 'utf8')
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

/**
 * Write the current session state to .veridia/session.json.
 * Creates the .veridia directory if it does not exist.
 *
 * @param session - The session state to persist.
 * @param root - The project root directory (defaults to process.cwd()).
 */
export function writeSession(session: Session, root: string = process.cwd()): void {
  const dir = sessionDir(root)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(sessionFile(root), JSON.stringify(session, null, 2), 'utf8')
}

/**
 * Clear the current session by deleting .veridia/session.json.
 *
 * @param root - The project root directory (defaults to process.cwd()).
 */
export function clearSession(root: string = process.cwd()): void {
  const file = sessionFile(root)
  if (existsSync(file)) {
    unlinkSync(file)
  }
}
