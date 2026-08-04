import { cpSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentInfo } from '../agent/types.js';

function packageRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..');
}

export function bundledSkillDirs(sourceRoot?: string): string[] {
  const skillsRoot = sourceRoot ?? join(packageRoot(), 'skills');
  if (!existsSync(skillsRoot)) return [];
  return readdirSync(skillsRoot)
    .filter((name) => name.startsWith('veridia-'))
    .map((name) => join(skillsRoot, name));
}

export function installSkills(agent: AgentInfo, target: string, sourceRoot?: string): string[] {
  const destRoot = join(target, agent.configDir, 'skills');
  const installed: string[] = [];
  for (const src of bundledSkillDirs(sourceRoot)) {
    const dest = join(destRoot, basename(src));
    cpSync(src, dest, { recursive: true, force: true });
    installed.push(dest);
  }
  return installed;
}
