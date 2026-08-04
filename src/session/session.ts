import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Session } from './types.js';

function sessionDir(root: string): string {
  return join(root, '.veridia');
}

function sessionFile(root: string): string {
  return join(sessionDir(root), 'session.json');
}

export function readSession(root: string = process.cwd()): Session | null {
  const file = sessionFile(root);
  if (!existsSync(file)) return null;
  try {
    const raw = readFileSync(file, 'utf8');
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function writeSession(session: Session, root: string = process.cwd()): void {
  const dir = sessionDir(root);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(sessionFile(root), JSON.stringify(session, null, 2), 'utf8');
}

export function clearSession(root: string = process.cwd()): void {
  const file = sessionFile(root);
  if (existsSync(file)) {
    unlinkSync(file);
  }
}
