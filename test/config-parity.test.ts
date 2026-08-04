import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { VERSION } from '../src/cli/version.js'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8')) as {
  version: string
}

describe('version source of truth', () => {
  it('matches package.json version', () => {
    expect(VERSION).toBe(pkg.version)
  })
})
