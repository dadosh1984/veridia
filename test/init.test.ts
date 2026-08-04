import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildAgentChoices, formatInitSummary } from '../src/cli/commands/init.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-init-'))
  tmpDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('buildAgentChoices', () => {
  it('pre-selects agents whose config directory exists in the target', () => {
    const target = makeTmpDir()
    fs.mkdirSync(path.join(target, '.opencode'), { recursive: true })
    const choices = buildAgentChoices(target)
    const opencode = choices.find((c) => c.value === 'opencode')
    const claude = choices.find((c) => c.value === 'claude')
    expect(opencode?.hint).toBe('detected')
    expect(claude?.hint).toBeUndefined()
    expect(choices.length).toBeGreaterThan(20)
  })
})

describe('formatInitSummary', () => {
  it('renders agent counts and the config line', () => {
    const summary = formatInitSummary([
      { agent: 'opencode', commandsGenerated: ['a', 'b'], skillsInstalled: ['s1', 's2', 's3'] },
      { agent: 'claude', commandsGenerated: [], skillsInstalled: ['s1'] },
    ])
    expect(summary).toContain('opencode')
    expect(summary).toContain('2 command')
    expect(summary).toContain('3 skill')
    expect(summary).toContain('claude')
    expect(summary).toContain('.veridia/config.json')
    expect(summary).not.toContain('s1')
  })
})
