import type { TaskType } from '../classify/types.js';

const FULL_TDD_STEPS = ['ask', 'write-failing-test', 'implement', 'verify'];
const EXPLORE_STEPS = ['ask', 'research', 'present-options'];
const DOC_STEPS = ['ask', 'document', 'review'];

export interface TypePlan {
  steps: string[];
}

export function mapType(type: TaskType): TypePlan {
  switch (type) {
    case 'explore':
    case 'open':
      return { steps: EXPLORE_STEPS };
    case 'doc':
      return { steps: DOC_STEPS };
    case 'bugfix':
    case 'refactor':
    case 'feature':
    default:
      return { steps: FULL_TDD_STEPS };
  }
}
