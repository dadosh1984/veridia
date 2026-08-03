import type { Classification, TaskType } from './types.js';
import type { VeridiaConfig } from '../config/config.js';

interface Rule {
  type: TaskType;
  patterns: RegExp[];
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
];

function buildRulesFromConfig(config: VeridiaConfig): Rule[] {
  const rules: Rule[] = [];
  for (const [type, patternStrings] of Object.entries(config.classify.patterns)) {
    rules.push({
      type: type as TaskType,
      patterns: patternStrings.map((p) => new RegExp(p, 'i')),
    });
  }
  return rules;
}

export function classify(task: string, config?: VeridiaConfig): Classification {
  const lower = task.toLowerCase();
  const rules = config ? buildRulesFromConfig(config) : RULES;

  let best: Classification | null = null;

  for (const rule of rules) {
    let hits = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) hits++;
    }
    if (hits === 0) continue;

    const confidence = Math.min(1, hits / rule.patterns.length);
    if (best === null || confidence > best.confidence) {
      best = { type: rule.type, confidence };
    }
  }

  return best ?? { type: 'open', confidence: 0.2 };
}
