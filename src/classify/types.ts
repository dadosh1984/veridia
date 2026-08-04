/** The type of task being classified. */
export type TaskType = 'bugfix' | 'refactor' | 'feature' | 'doc' | 'explore' | 'open'

/** All valid task type values. */
export const TASK_TYPES: readonly TaskType[] = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open']

/**
 * Type guard for TaskType.
 * @param x - The value to check.
 * @returns True if x is a valid TaskType.
 */
export function isTaskType(x: string): x is TaskType {
  return TASK_TYPES.includes(x as TaskType)
}

/** The result of classifying a task string. */
export interface Classification {
  /** The classified task type. */
  type: TaskType
  /** A confidence score between 0 and 1 indicating how certain the classification is. */
  confidence: number
}
