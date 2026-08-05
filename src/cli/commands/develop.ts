import fs from 'node:fs'
import path from 'node:path'
import { triage } from '../../triage/triage.js'
import { jsonOut } from '../shared.js'

export async function handle(changeName: string, opts: { target?: string; self?: boolean; verbose?: boolean }): Promise<void> {
  if (!changeName && !opts.self) {
    process.stderr.write('veridia: develop requires --change <name> or --self\n')
    process.exitCode = 1
    return
  }

  const root = opts.target ? path.resolve(opts.target) : process.cwd()
  const targetDir = opts.self ? root : path.join(root, 'warpweave', 'changes', changeName)

  if (!opts.self) {
    const proposalPath = path.join(targetDir, 'proposal.md')
    if (!fs.existsSync(proposalPath)) {
      process.stderr.write(`veridia: change "${changeName}" not found at ${targetDir}\n`)
      process.exitCode = 1
      return
    }
  }

  const task = opts.self
    ? 'verify project quality after changes'
    : (() => {
        const proposal = fs.readFileSync(path.join(targetDir, 'proposal.md'), 'utf8')
        const lines = proposal
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#'))
        return lines[0] || changeName
      })()

  const result = await triage(task, targetDir, { auto: true, streamOutput: opts.verbose })

  jsonOut({
    verdict: result.verdict,
    type: result.type,
    level: result.level,
  })

  process.exitCode = result.verdict === 'FAIL' ? 1 : 0
}
