import fs from 'node:fs'
import path from 'node:path'
import { note, outro } from '@clack/prompts'
import { generateReport, generateHtmlReport } from '../../analyze/report.js'
import { jsonOut } from '../shared.js'

export async function handle(opts: { target?: string; format?: string; output?: string; json?: boolean }): Promise<void> {
  const target = opts.target ? path.resolve(opts.target) : process.cwd()

  if (!fs.existsSync(target)) {
    process.stderr.write(`veridia: report: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }

  const format = opts.format ?? 'markdown'
  const output = opts.output

  let content: string
  if (format === 'html') {
    content = generateHtmlReport(target)
  } else {
    content = generateReport(target)
  }

  if (opts.json) {
    jsonOut({ format, length: content.length })
    return
  }

  if (output) {
    const outPath = path.resolve(output)
    fs.writeFileSync(outPath, content, 'utf8')
    note(`Report written to ${outPath}`, 'veridia report')
  } else {
    process.stdout.write(content)
  }

  outro(`report generated (${format}, ${content.length} bytes)`)
}
