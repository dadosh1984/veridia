import { cpSync, existsSync, readdirSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AgentInfo } from '../agent/types.js'

function packageRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url))
  return join(here, '..', '..')
}

/**
 * Get the list of bundled veridia skill directories.
 *
 * @param sourceRoot - Optional custom source root (defaults to package root + 'skills').
 * @returns An array of absolute paths to skill directories.
 */
export function bundledSkillDirs(sourceRoot?: string): string[] {
  const skillsRoot = sourceRoot ?? join(packageRoot(), 'skills')
  if (!existsSync(skillsRoot)) return []
  return readdirSync(skillsRoot)
    .filter((name) => name.startsWith('veridia-'))
    .map((name) => join(skillsRoot, name))
}

/**
 * Install bundled veridia skills into the agent's skills directory.
 *
 * @param agent - The agent to install skills for.
 * @param target - The target project root directory.
 * @param sourceRoot - Optional custom source root for bundled skills.
 * @returns An array of absolute paths to installed skill directories.
 */
export function installSkills(agent: AgentInfo, target: string, sourceRoot?: string): string[] {
  const destRoot = join(target, agent.configDir, 'skills')
  const installed: string[] = []
  for (const src of bundledSkillDirs(sourceRoot)) {
    const dest = join(destRoot, basename(src))
    cpSync(src, dest, { recursive: true, force: true })
    installed.push(dest)
  }
  return installed
}
