import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { autoFix } from '../src/analyze/fix.js'
import { runCliIn } from './helpers/run-cli.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-fix-'))
  tmpDirs.push(dir)
  return dir
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function readFile(dir: string, rel: string): string {
  return fs.readFileSync(path.join(dir, rel), 'utf8')
}

function runGit(dir: string, ...args: string[]): void {
  const r = require('node:child_process').spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
  if (r.error) throw r.error
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('autoFix — template literal safety', () => {
  it('does NOT remove console.log text inside a multiline template literal', () => {
    const dir = makeTmpDir()
    const template = 'const code = `\nfunction run() {\n  console.log(result)\n}\n`;\nrelease(code);\n'
    writeFile(dir, 'src/a.ts', template)
    autoFix(dir, { force: true })
    expect(readFile(dir, 'src/a.ts')).toBe(template)
  })
})

describe('autoFix — multiline console statement', () => {
  it('removes a console.log call spanning multiple lines', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'src/a.ts', 'const x = 1;\nconsole.log(\n  a,\n  b\n);\nconst y = 2;\n')
    const result = autoFix(dir, { force: true })
    expect(result.fixed).toBe(1)
    expect(readFile(dir, 'src/a.ts')).toContain('const x = 1;')
    expect(readFile(dir, 'src/a.ts')).toContain('const y = 2;')
    expect(readFile(dir, 'src/a.ts')).not.toContain('console.log')
  })
})

describe('autoFix — TODO in string', () => {
  it('does NOT remove TODO text inside a string literal', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'src/a.ts', "const msg = 'TODO: later';\n")
    autoFix(dir, { force: true })
    expect(readFile(dir, 'src/a.ts')).toBe("const msg = 'TODO: later';\n")
  })

  it('removes a real TODO comment', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'src/a.ts', '// TODO: implement\nconst x = 1;\n')
    runGit(dir, 'init', '-q')
    const result = autoFix(dir, { force: true })
    expect(result.fixed).toBe(1)
    expect(readFile(dir, 'src/a.ts')).toContain('const x = 1;')
    expect(readFile(dir, 'src/a.ts')).not.toContain('TODO')
  })
})

describe('autoFix — dry-run', () => {
  it('reports details without writing to disk', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'src/a.ts', 'console.log("hi");\n')
    const result = autoFix(dir, { dryRun: true })
    expect(result.fixed).toBe(1)
    expect(result.details.length).toBe(1)
    expect(readFile(dir, 'src/a.ts')).toBe('console.log("hi");\n')
  })
})

describe('autoFix — git-dirty guard', () => {
  function makeGitRepo(content: string): string {
    const dir = makeTmpDir()
    runGit(dir, 'init', '-q')
    writeFile(dir, 'src/a.ts', content)
    runGit(dir, 'add', '-A')
    runGit(dir, 'commit', '-qm', 'initial')
    return dir
  }

  it('uncommitted tree → refuses to write (non-zero exit, no file change)', () => {
    const dir = makeGitRepo('const ok = 1;\n')
    writeFile(dir, 'src/dirty.ts', 'console.log("oops");\n')
    const result = runCliIn(dir, 'fix')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toMatch(/uncommitted|force/i)
    expect(readFile(dir, 'src/dirty.ts')).toBe('console.log("oops");\n')
  })

  it('--force writes despite a dirty tree', () => {
    const dir = makeGitRepo('const ok = 1;\n')
    writeFile(dir, 'src/dirty.ts', 'console.log("oops");\n')
    const result = runCliIn(dir, 'fix', '--force')
    expect(result.exitCode).toBe(0)
    expect(readFile(dir, 'src/dirty.ts')).not.toContain('console.log')
  })

  it('dry-run is not blocked on a dirty tree', () => {
    const dir = makeGitRepo('const ok = 1;\n')
    writeFile(dir, 'src/dirty.ts', 'console.log("oops");\n')
    const result = runCliIn(dir, 'fix', '--dry-run')
    expect(result.exitCode).toBe(0)
    expect(readFile(dir, 'src/dirty.ts')).toBe('console.log("oops");\n')
  })

  it('non-git directory is not blocked', () => {
    const dir = makeTmpDir()
    writeFile(dir, 'src/a.ts', 'console.log("hi");\n')
    const result = runCliIn(dir, 'fix')
    expect(result.exitCode).toBe(0)
    expect(readFile(dir, 'src/a.ts')).not.toContain('console.log')
  })
})
