import type { Oracle, VerifiabilityLevel } from './types.js'

const NON_DETERMINISTIC_HINTS = new Set(['explore', 'open'])

export function mapLevel(oracles: Oracle[], taskHint?: string): VerifiabilityLevel {
  const kinds = new Set(oracles.map((o) => o.kind))
  if (kinds.size === 0) return 1

  const deterministic = taskHint === undefined || !NON_DETERMINISTIC_HINTS.has(taskHint)

  const testContent = oracles.find((o) => o.kind === 'test-content')
  const testsWeak = testContent !== undefined && testContent.present === false

  if (kinds.has('test-runner') && deterministic && !testsWeak) return 3

  if (kinds.has('test-runner') || kinds.has('type-check') || kinds.has('lint')) return 2

  return 1
}
