import type { TaskType } from '../classify/types.js';
import type { VerifiabilityLevel } from '../assess/types.js';
import { selectQuestions } from './select.js';
import { promptQuestions } from './prompt.js';
import type { AskResult } from './types.js';

export function ask(type: TaskType, level: VerifiabilityLevel, auto?: boolean): AskResult {
  if (auto) return { questions: [] };
  if (level === 2 || level === 3) {
    return { questions: [] };
  }
  return { questions: selectQuestions(type, level) };
}

export interface AskInteractiveDeps {
  promptQuestions?: (questions: import('./types.js').ClarifyingQuestion[]) => Promise<Record<string, string>>;
}

export async function askInteractive(
  type: TaskType,
  level: VerifiabilityLevel,
  auto?: boolean,
  deps: AskInteractiveDeps = {},
): Promise<AskResult> {
  if (auto) return { questions: [] };
  if (level === 2 || level === 3) {
    return { questions: [] };
  }
  const questions = selectQuestions(type, level);
  const prompt = deps.promptQuestions ?? promptQuestions;
  const answers = await prompt(questions);
  return { questions, answers };
}
