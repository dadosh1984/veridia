import type { Classification, TaskType } from './types.js';

interface Rule {
  type: TaskType;
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    type: 'bugfix',
    patterns: [/fix/, /bug/, /crash/, /null pointer/, /error/, /broken/, /patch/],
  },
  {
    type: 'feature',
    patterns: [/add/, /implement/, /support/, /new/, /feature/, /introduce/, /enable/],
  },
  {
    type: 'doc',
    patterns: [/doc/, /document/, /readme/, /comment/, /write.*guide/],
  },
  {
    type: 'refactor',
    patterns: [/refactor/, /restructure/, /clean ?up/, /simplify/, /extract/, /rename/],
  },
  {
    type: 'explore',
    patterns: [/evaluate/, /explore/, /research/, /compare/, /investigate/, /options?/],
  },
];

export function classify(task: string): Classification {
  const lower = task.toLowerCase();

  let best: Classification | null = null;

  for (const rule of RULES) {
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
