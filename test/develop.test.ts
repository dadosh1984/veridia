import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runCliIn } from './helpers/run-cli.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-develop-'))
  tmpDirs.push(dir)
  return dir
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('veridia develop', () => {
  it('exits 0 and prints JSON with verdict for a valid change', () => {
    const dir = makeTmpDir()
    const changeDir = path.join(dir, 'warpweave', 'changes', 'test-change')
    fs.mkdirSync(changeDir, { recursive: true })
    writeFile(changeDir, 'proposal.md', '## Why\n\nfix login timeout\n\n## What Changes\n- fix the timeout\n')
    writeFile(dir, 'package.json', '{}')

    const result = runCliIn(dir, 'develop', '--change', 'test-change')
    expect(result.exitCode).toBe(0)
    const parsed = JSON.parse(result.stdout) as { verdict: string }
    expect(parsed.verdict).toBeDefined()
  })

  it('exits non-zero with stderr error when --change is missing', () => {
    const dir = makeTmpDir()
    const result = runCliIn(dir, 'develop')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toMatch(/change/i)
  })

  it('records the cycle to .veridia/history.jsonl', () => {
    const dir = makeTmpDir()
    const changeDir = path.join(dir, 'warpweave', 'changes', 'test-change')
    fs.mkdirSync(changeDir, { recursive: true })
    writeFile(changeDir, 'proposal.md', '## Why\n\nfix login timeout\n\n## What Changes\n- fix the timeout\n')
    writeFile(dir, 'package.json', '{}')

    runCliIn(dir, 'develop', '--change', 'test-change')
    const historyFile = path.join(changeDir, '.veridia', 'history.jsonl')
    expect(fs.existsSync(historyFile)).toBe(true)
    const lines = fs.readFileSync(historyFile, 'utf8').trim().split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(1)
  })
})
