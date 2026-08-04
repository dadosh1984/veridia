import { createInterface } from 'node:readline';
import type { ClarifyingQuestion } from './types.js';

export function promptQuestion(question: ClarifyingQuestion): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const optionsText = question.options.map((opt, i) => `  ${i + 1}) ${opt}`).join('\n');
    rl.question(`${question.prompt}\n${optionsText}\n> `, (answer) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (isNaN(num) || num < 1 || num > question.options.length) {
        resolve(promptQuestion(question));
      } else {
        resolve(question.options[num - 1]);
      }
    });
  });
}

export async function promptQuestions(questions: ClarifyingQuestion[]): Promise<Record<string, string>> {
  const answers: Record<string, string> = {};
  for (const q of questions) {
    answers[q.id] = await promptQuestion(q);
  }
  return answers;
}
