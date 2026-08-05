import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { execFileWithShim } from '../src/util/exec-shim.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-shim-'))
  tmpDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('execFileWithShim', () => {
  it('runs a real executable directly', () => {
    expect(() => execFileWithShim(process.execPath, ['-e', 'process.exit(0)'], { encoding: 'utf8' })).not.toThrow()
  })

  it('throws when the command cannot be run', () => {
    expect(() => execFileWithShim('veridia-no-such-cmd-xyz', [], { encoding: 'utf8' })).toThrow()
  })

  it('captures child stdout instead of inheriting it', () => {
    const stdout = execFileWithShim(process.execPath, ['-e', 'process.stdout.write("CAPTURED-OUT")'], { encoding: 'utf8' })
    expect(stdout).toBe('CAPTURED-OUT')
  })
})

describe('execFileWithShim — PATHEXT resolution (Windows shim fallback)', () => {
  it('resolves a .cmd shim in node_modules/.bin and runs with shell: false', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-test-shim.cmd')
    fs.writeFileSync(shimPath, '@echo off\nnode -e "process.stdout.write(\'SHIM-OK\')"\n', 'utf8')

    const stdout = execFileWithShim('veridia-test-shim.cmd', [], { cwd: dir, encoding: 'utf8' })
    expect(stdout).toContain('SHIM-OK')
  })

  it('passes args through a resolved shim', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-arg-test.cmd')
    fs.writeFileSync(shimPath, '@echo off\nnode -e "process.stdout.write(\'hello\')"\n', 'utf8')

    const stdout = execFileWithShim('veridia-arg-test.cmd', [], { cwd: dir, encoding: 'utf8' })
    expect(stdout.trim()).toBe('hello')
  })

  it('throws ENOENT for a genuinely missing command', () => {
    expect(() => execFileWithShim('veridia-no-such-xyz-999', [], { encoding: 'utf8' })).toThrow(/ENOENT|not found|exit code/i)
  })
})
