import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { AgentInfo } from '../agent/types.js';
import { getCommandFiles } from './adapters.js';

export function generateCommands(agent: AgentInfo, target: string): string[] {
  const files = getCommandFiles(agent);
  const generated: string[] = [];
  for (const file of files) {
    const fullPath = join(target, file.path);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, file.content, 'utf8');
    generated.push(file.path);
  }
  return generated;
}
