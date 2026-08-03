import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import { selectQuestions } from './select.js';
import type { AskResult } from './types.js';

export function ask(type: TaskType, level: VerifiabilityLevel): AskResult {
  if (level === 2 || level === 3) {
    return { questions: [] };
  }
  return { questions: selectQuestions(type, level) };
}
