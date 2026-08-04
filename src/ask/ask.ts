import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import { promptQuestions } from './prompt.js'
import { selectQuestions } from './select.js'
import type { AskResult } from './types.js'

/**
 * Generate clarifying questions for a task based on its type and verifiability level.
 * Skips questions for auto mode or high-verifiability levels (2, 3).
 *
 * @param type - The classified task type.
 * @param level - The assessed verifiability level.
 * @param auto - If true, skip all questions (automated mode).
 * @returns An AskResult with the generated questions.
 */
export function ask(type: TaskType, level: VerifiabilityLevel, auto?: boolean): AskResult {
  if (auto) return { questions: [] }
  if (level === 2 || level === 3) {
    return { questions: [] }
  }
  return { questions: selectQuestions(type, level) }
}

/** Dependencies for askInteractive, allowing injection of a custom prompt function. */
export interface AskInteractiveDeps {
  /** Optional custom function to prompt the user with questions and return answers. */
  promptQuestions?: (questions: import('./types.js').ClarifyingQuestion[]) => Promise<Record<string, string>>
}

/**
 * Generate clarifying questions and interactively prompt the user for answers.
 * Skips questions for auto mode or high-verifiability levels (2, 3).
 *
 * @param type - The classified task type.
 * @param level - The assessed verifiability level.
 * @param auto - If true, skip all questions (automated mode).
 * @param deps - Optional dependency overrides (e.g. for testing).
 * @returns A promise resolving to an AskResult with questions and user answers.
 */
export async function askInteractive(type: TaskType, level: VerifiabilityLevel, auto?: boolean, deps: AskInteractiveDeps = {}): Promise<AskResult> {
  if (auto) return { questions: [] }
  if (level === 2 || level === 3) {
    return { questions: [] }
  }
  const questions = selectQuestions(type, level)
  const prompt = deps.promptQuestions ?? promptQuestions
  const answers = await prompt(questions)
  return { questions, answers }
}
