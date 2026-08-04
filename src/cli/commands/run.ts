import fs from 'node:fs'
import path from 'node:path'
import { intro, outro, spinner, note, confirm, isCancel, cancel } from '@clack/prompts'
import { triage } from '../../triage/triage.js'

export async function handle(task: string, opts: { target?: string; auto?: boolean; self?: boolean; ww?: boolean; change?: string }): Promise<void> {
  let target = opts.target ? path.resolve(opts.target) : process.cwd()
  let auto = opts.auto ?? false

  if (opts.self) {
    target = process.cwd()
  }

  if (opts.ww && opts.change) {
    const changeDir = path.resolve(target, 'warpweave', 'changes', opts.change)
    if (fs.existsSync(changeDir)) {
      target = changeDir
    }
  }

  if (!task) {
    process.stderr.write('veridia: run requires a task description\n')
    process.exitCode = 1
    return
  }

  const resolved = path.resolve(target)
  if (!fs.existsSync(resolved)) {
    process.stderr.write(`veridia: target path does not exist: ${target}\n`)
    process.exitCode = 1
    return
  }

  intro(`veridia run`)

  const spin = spinner()
  const stages: { stage: string; detail?: string }[] = []

  const result = await triage(task, resolved, {
    auto,
    progress: (stage, detail) => {
      stages.push({ stage, detail })
      spin.message(`${stage}${detail ? `: ${detail}` : ''}`)
    },
  })

  spin.stop('done')

  note(JSON.stringify(stages.map((s) => `→ ${s.stage}${s.detail ? `: ${s.detail}` : ''}`).join('\n'), null, 2).replace(/^"|"$/g, ''), 'Progress')

  const lines = [
    `type       ${result.type.padEnd(12)} ${result.confidence.toFixed(2)}`,
    `level      ${result.level}`,
    `plan       ${result.plan.depth.padEnd(12)} ${result.plan.tier}`,
  ]
  if (result.questions.length > 0) {
    lines.push(`questions  ${result.questions.length}`)
  }
  if (result.answers && Object.keys(result.answers).length > 0) {
    for (const [id, answer] of Object.entries(result.answers)) {
      lines.push(`answer     ${id}: ${answer}`)
    }
  }
  lines.push(`verdict    ${result.verdict}`)

  note(lines.join('\n'), 'Result')

  if (result.executionPlan) {
    const stepLines = result.executionPlan.plan.steps.map((s, i) => `  ${i + 1}. ${s.id} — ${s.action}`)
    const gateLines = result.executionPlan.plan.gates.map((g) => `  • ${g.id}: ${g.command || '(manual)'}`)
    note(
      `STEPS:\n${stepLines.join('\n')}\n\nGATES:\n${gateLines.join('\n')}\n\n⚠️  Agent MUST follow these steps in order. Do not skip or reorder.`,
      'Execution Plan',
    )
  }

  outro(`verdict: ${result.verdict}`)

  if (!auto && result.executionPlan) {
    const proceed = await confirm({
      message: 'Follow the execution plan now?',
    })
    if (isCancel(proceed) || !proceed) {
      cancel('Plan not followed — task marked as HUMAN')
      process.exitCode = 1
      return
    }
  }
}
