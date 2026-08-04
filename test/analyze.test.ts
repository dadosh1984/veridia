import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runAnalysis } from '../src/analyze/analyze.js'
import { checkConsoleLog, checkDangerousPatterns, checkHardcodedSecrets, checkMissingTryCatch, checkTodo } from '../src/analyze/checks.js'

const tmpDirs: string[] = []

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'veridia-analyze-'))
  tmpDirs.push(dir)
  return dir
}

function writeFile(dir: string, rel: string, content: string): void {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('checkHardcodedSecrets', () => {
  it('detects hardcoded API keys', () => {
    const findings = checkHardcodedSecrets('test.ts', 'const apiKey = "sk-1234567890abcdef";')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].severity).toBe('ERROR')
  })

  it('detects hardcoded passwords', () => {
    const findings = checkHardcodedSecrets('test.ts', 'const password = "supersecret123";')
    expect(findings.length).toBeGreaterThan(0)
  })

  it('does not flag short strings', () => {
    const findings = checkHardcodedSecrets('test.ts', 'const key = "abc";')
    expect(findings.length).toBe(0)
  })
})

describe('checkDangerousPatterns', () => {
  it('detects eval()', () => {
    const findings = checkDangerousPatterns('test.ts', 'eval(userInput);')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].severity).toBe('ERROR')
  })

  it('detects shell: true', () => {
    const findings = checkDangerousPatterns('test.ts', 'execFileSync(cmd, { shell: true });')
    expect(findings.length).toBeGreaterThan(0)
  })
})

describe('checkMissingTryCatch', () => {
  it('flags readFileSync without try/catch', () => {
    const findings = checkMissingTryCatch('test.ts', 'const data = readFileSync("file.txt");')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].severity).toBe('WARNING')
  })

  it('does not flag readFileSync inside try/catch', () => {
    const findings = checkMissingTryCatch('test.ts', 'try {\n  const data = readFileSync("file.txt");\n} catch (e) {}')
    expect(findings.length).toBe(0)
  })
})

describe('checkConsoleLog', () => {
  it('detects console.log', () => {
    const findings = checkConsoleLog('test.ts', 'console.log("hello");')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].severity).toBe('INFO')
  })
})

describe('checkTodo', () => {
  it('detects TODO comments', () => {
    const findings = checkTodo('test.ts', '// TODO: implement this')
    expect(findings.length).toBeGreaterThan(0)
    expect(findings[0].severity).toBe('INFO')
  })
})

describe('runAnalysis', () => {
  it('returns findings for a target with issues', () => {
    const target = makeTmpDir()
    writeFile(target, 'src/index.ts', 'const apiKey = "sk-1234567890abcdef";\nconsole.log(apiKey);\n')
    const result = runAnalysis(target)
    expect(result.totalFiles).toBe(1)
    expect(result.totalFindings).toBeGreaterThan(0)
    expect(result.errors).toBeGreaterThan(0)
  })

  it('returns empty findings for clean code', () => {
    const target = makeTmpDir()
    writeFile(target, 'src/index.ts', 'const x = 1;\nexport function add(a: number, b: number) { return a + b; }\n')
    const result = runAnalysis(target)
    expect(result.totalFiles).toBe(1)
    expect(result.totalFindings).toBe(0)
  })

  it('skips node_modules directory', () => {
    const target = makeTmpDir()
    writeFile(target, 'node_modules/bad/index.js', 'const password = "hunter2";\n')
    writeFile(target, 'src/index.ts', 'const x = 1;\n')
    const result = runAnalysis(target)
    expect(result.totalFiles).toBe(1)
  })
})
