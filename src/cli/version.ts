import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const candidates = [
  join(__dirname, 'package.json'),
  join(__dirname, '..', 'package.json'),
  join(__dirname, '..', '..', 'package.json'),
  join(process.cwd(), 'package.json'),
]
const pkgPath = candidates.find(existsSync)
const pkg = pkgPath ? (JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string }) : { version: '0.0.0' }
export const VERSION = pkg.version
