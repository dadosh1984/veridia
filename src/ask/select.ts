import type { VerifiabilityLevel } from '../assess/types.js'
import type { TaskType } from '../classify/types.js'
import { EXPECTED_OUTCOME_QUESTION, QUESTION_BANK } from './bank.js'
import type { ClarifyingQuestion } from './types.js'

function hasId(questions: ClarifyingQuestion[], id: string): boolean {
  return questions.some((q) => q.id === id)
}

export function selectQuestions(type: TaskType, level: VerifiabilityLevel): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = []

  for (const q of QUESTION_BANK[type]) {
    if (!hasId(questions, q.id)) questions.push(q)
  }

  if (questions.length < 2 || level === 0) {
    if (!hasId(questions, EXPECTED_OUTCOME_QUESTION.id)) questions.push(EXPECTED_OUTCOME_QUESTION)
  }

  return questions
}
