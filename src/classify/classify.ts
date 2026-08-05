import type { VeridiaConfig } from '../config/config.js'
import { log as vlog } from '../util/log.js'
import type { Classification, TaskType } from './types.js'

interface Rule {
  type: TaskType
  patterns: RegExp[]
}

const RULES: Rule[] = [
  {
    type: 'bugfix',
    patterns: [/\bfix\b/, /\bbug\b/, /\bcrash\b/, /\bnull pointer\b/, /\berror\b/, /\bbroken\b/, /\bpatch\b/],
  },
  {
    type: 'feature',
    patterns: [/\badd\b/, /\bimplement\b/, /\bsupport\b/, /\bnew\b/, /\bfeature\b/, /\bintroduce\b/, /\benable\b/],
  },
  {
    type: 'doc',
    patterns: [/\bdoc\b/, /\bdocument\b/, /\breadme\b/, /\bcomment\b/, /\bwrite.*guide\b/],
  },
  {
    type: 'refactor',
    patterns: [/\brefactor\b/, /\brestructure\b/, /\bclean ?up\b/, /\bsimplify\b/, /\bextract\b/, /\brename\b/],
  },
  {
    type: 'explore',
    patterns: [/\bevaluate\b/, /\bexplore\b/, /\bresearch\b/, /\bcompare\b/, /\binvestigate\b/, /\boptions?\b/],
  },
]

function buildRulesFromConfig(config: VeridiaConfig): Rule[] {
  const rules: Rule[] = []
  for (const [type, patternStrings] of Object.entries(config.classify.patterns)) {
    const patterns: RegExp[] = []
    for (const p of patternStrings) {
      try {
        patterns.push(new RegExp(p, 'i'))
      } catch {
        vlog.error(`classify: skipping invalid pattern '${p}' for type '${type}'`)
      }
    }
    if (patterns.length === 0) continue
    rules.push({
      type: type as TaskType,
      patterns,
    })
  }
  return rules
}

/**
 * Classify a task string into a TaskType by matching against keyword patterns.
 * Returns the type with the highest pattern-match confidence, or 'open' with 0.2 confidence as fallback.
 *
 * @param task - The raw task description string to classify.
 * @param config - Optional configuration with custom classification patterns.
 * @returns A Classification with the best-matching type and confidence score.
 */
export function classify(task: string, config?: VeridiaConfig): Classification {
  const lower = task.toLowerCase()
  const rules = config ? buildRulesFromConfig(config) : RULES

  let best: Classification | null = null

  for (const rule of rules) {
    let hits = 0
    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) hits++
    }
    if (hits === 0) continue

    const confidence = Math.min(1, hits / rule.patterns.length)
    if (best === null || confidence > best.confidence) {
      best = { type: rule.type, confidence }
    }
  }

  return best ?? { type: 'open', confidence: 0.2 }
}
