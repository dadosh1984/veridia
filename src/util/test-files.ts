import path from 'node:path'

/** A minimal filesystem abstraction for test file detection. */
export interface TestFs {
  /** List directory entries. */
  readdirSync(p: string): string[]
  /** Read a file's contents as a string. */
  readFileSync(p: string): string
}

const TEST_TOKEN = /\b(test|it|expect|assert)\b/

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|js|jsx|mjs|mts)$/

const TEST_DIR_NAMES = new Set(['test', 'tests', '__tests__'])

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache'])

function isTestFile(name: string): boolean {
  return TEST_FILE_PATTERN.test(name)
}

function isTestDir(name: string): boolean {
  return TEST_DIR_NAMES.has(name)
}

function collectTestFiles(fs: TestFs, dir: string, out: string[]): void {
  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = path.join(dir, entry)
    if (isTestFile(entry)) {
      out.push(full)
      continue
    }
    if (isTestDir(entry)) {
      collectTestFiles(fs, full, out)
      continue
    }
    let children: string[]
    try {
      children = fs.readdirSync(full)
    } catch {
      continue
    }
    if (children.length > 0) {
      collectTestFiles(fs, full, out)
    }
  }
}

/**
 * Check whether a directory contains meaningful tests (test files with actual assertions).
 *
 * @param fs - The filesystem abstraction to use.
 * @param dir - The directory to search for test files.
 * @returns True if at least one test file with test/expect/assert tokens is found.
 */
export function hasMeaningfulTests(fs: TestFs, dir: string): boolean {
  const testFiles: string[] = []
  collectTestFiles(fs, dir, testFiles)
  if (testFiles.length === 0) return false
  for (const file of testFiles) {
    if (TEST_TOKEN.test(fs.readFileSync(file))) return true
  }
  return false
}
