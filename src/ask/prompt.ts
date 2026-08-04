import { createInterface, type Interface } from 'node:readline'
import type { ClarifyingQuestion } from './types.js'

export function promptQuestion(question: ClarifyingQuestion, rl: Interface): Promise<string> {
  return new Promise((resolve) => {
    const optionsText = question.options.map((opt, i) => `  ${i + 1}) ${opt}`).join('\n')
    rl.question(`${question.prompt}\n${optionsText}\n> `, (answer) => {
      const num = parseInt(answer.trim(), 10)
      if (Number.isNaN(num) || num < 1 || num > question.options.length) {
        resolve(promptQuestion(question, rl))
      } else {
        resolve(question.options[num - 1] ?? '')
      }
    })
  })
}

export async function promptQuestions(questions: ClarifyingQuestion[]): Promise<Record<string, string>> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answers: Record<string, string> = {}
  try {
    for (const q of questions) {
      answers[q.id] = await promptQuestion(q, rl)
    }
  } finally {
    rl.close()
  }
  return answers
}
