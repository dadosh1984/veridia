import { classify } from '../../classify/classify.js'
import { jsonOut } from '../shared.js'

export function handle(task: string): void {
  if (task === '') {
    process.stderr.write('veridia: classify requires a task string\n')
    process.exitCode = 1
    return
  }
  const result = classify(task)
  jsonOut({ type: result.type, confidence: result.confidence })
}
