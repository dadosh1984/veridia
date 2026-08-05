import { classify } from '../../classify/classify.js'
import { log as vlog } from '../../util/log.js'
import { jsonOut } from '../shared.js'

export function handle(task: string): void {
  if (task === '') {
    vlog.error('classify requires a task string')
    process.exitCode = 1
    return
  }
  const result = classify(task)
  jsonOut({ type: result.type, confidence: result.confidence })
}
