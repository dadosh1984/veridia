import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { AgentInfo } from '../agent/types.js'
import { getCommandFiles } from './adapters.js'

/**
 * Generate veridia command files for a given agent in the target directory.
 * Creates the necessary skill/command files for the agent to use veridia.
 *
 * @param agent - The agent to generate commands for.
 * @param target - The target project root directory.
 * @returns An array of relative file paths that were generated.
 */
export function generateCommands(agent: AgentInfo, target: string): string[] {
  const files = getCommandFiles(agent)
  const generated: string[] = []
  for (const file of files) {
    const fullPath = join(target, file.path)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, file.content, 'utf8')
    generated.push(file.path)
  }
  return generated
}
