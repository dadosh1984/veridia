import type { TaskType } from '../classify/types.js'

const FULL_TDD_STEPS = ['ask', 'write-failing-test', 'implement', 'verify']
const EXPLORE_STEPS = ['ask', 'research', 'present-options']
const DOC_STEPS = ['ask', 'document', 'review']

/** A plan derived from a task type. */
export interface TypePlan {
  /** The ordered list of step identifiers for this task type. */
  steps: string[]
}

/**
 * Map a task type to a TypePlan with appropriate execution steps.
 *
 * @param type - The classified task type.
 * @returns A TypePlan with the steps appropriate for the given type.
 */
export function mapType(type: TaskType): TypePlan {
  switch (type) {
    case 'explore':
    case 'open':
      return { steps: EXPLORE_STEPS }
    case 'doc':
      return { steps: DOC_STEPS }
    default:
      return { steps: FULL_TDD_STEPS }
  }
}
