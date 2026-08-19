import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveShim } from '../../src/util/exec-shim.js'

// ponytail: rung 6 (one-liner) — direct unit tests for the exported resolveShim helper.

const tmpDirs: string[] = []
function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-resolve-'))
  tmpDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true })
})

describe('resolveShim', () => {
  it('returns the full path when cmd with extension matches in PATH', () => {
    const dir = makeTmpDir()
    const shimPath = path.join(dir, 'veridia-ext.cmd')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: dir, PATHEXT: ';.CMD' }
    expect(resolveShim('veridia-ext.cmd', undefined, env)).toBe(shimPath)
  })

  it('appends each PATHEXT and finds a match', () => {
    const dir = makeTmpDir()
    const shimPath = path.join(dir, 'veridia-noext.exe')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: dir, PATHEXT: ';.EXE;.BAT' }
    expect(resolveShim('veridia-noext', undefined, env)).toBe(shimPath)
  })

  it('searches node_modules/.bin when cwd is provided', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-bin.cmd')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: '', PATHEXT: ';.CMD' }
    expect(resolveShim('veridia-bin', dir, env)).toBe(shimPath)
  })

  it('returns undefined when nothing matches', () => {
    const env = { PATH: '/no/such/path', PATHEXT: ';.CMD' }
    expect(resolveShim('veridia-missing-xyz', undefined, env)).toBeUndefined()
  })

  it('handles cmd with a directory separator (hasSep branch)', () => {
    const dir = makeTmpDir()
    const shimPath = path.join(dir, 'sub.cmd')
    fs.mkdirSync(path.dirname(shimPath), { recursive: true })
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: '', PATHEXT: ';.CMD' }
    // absolute path → hasSep=true, dirs = [dirname], base = filename with .cmd ext
    expect(resolveShim(shimPath, undefined, env)).toBe(shimPath)
  })

  it('handles cmd with / separator (POSIX hasSep)', () => {
    const dir = makeTmpDir()
    const shimPath = path.join(dir, 'posix.cmd')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: '', PATHEXT: ';.CMD' }
    // Normalize to forward-slashes for the POSIX hasSep branch
    const posixPath = shimPath.split(path.sep).join('/')
    expect(resolveShim(posixPath, undefined, env)).toBe(shimPath)
  })

  it('uses default PATHEXT when env has none', () => {
    const dir = makeTmpDir()
    const shimPath = path.join(dir, 'veridia-default.bat')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATH: dir } // no PATHEXT → default .COM;.EXE;.BAT;.CMD
    expect(resolveShim('veridia-default', undefined, env)).toBe(shimPath)
  })

  it('uses default PATH when env has none', () => {
    const dir = makeTmpDir()
    const binDir = path.join(dir, 'node_modules', '.bin')
    fs.mkdirSync(binDir, { recursive: true })
    const shimPath = path.join(binDir, 'veridia-empty.cmd')
    fs.writeFileSync(shimPath, '', 'utf8')
    const env = { PATHEXT: ';.CMD' }
    // PATH=undefined → ''.split → [] → dirs only gets node_modules/.bin from cwd
    expect(resolveShim('veridia-empty', dir, env)).toBe(shimPath)
  })
})
