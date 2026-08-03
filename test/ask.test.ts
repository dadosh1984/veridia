import { describe, expect, it } from 'vitest';
import { ask } from '../src/ask/ask.js';
import { QUESTION_BANK } from '../src/ask/bank.js';
import { selectQuestions } from '../src/ask/select.js';
import type { TaskType } from '../src/classify/types.js';
import type { VerifiabilityLevel } from '../src/assess/types.js';
import type { ClarifyingQuestion } from '../src/ask/types.js';

const TYPES: TaskType[] = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'];

describe('question bank', () => {
  it('every task type has a question entry', () => {
    for (const type of TYPES) {
      expect(QUESTION_BANK[type]).toBeDefined();
    }
  });

  it('each question has an id, prompt, and at least 2 options', () => {
    for (const type of TYPES) {
      for (const q of QUESTION_BANK[type]) {
        expect(q.id.length).toBeGreaterThan(0);
        expect(q.prompt.length).toBeGreaterThan(0);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('selectQuestions', () => {
  it('returns 2 to 3 questions for a level 1 feature', () => {
    const questions = selectQuestions('feature', 1);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions.length).toBeLessThanOrEqual(3);
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('injects an expected-outcome question at level 0 for open', () => {
    const questions = selectQuestions('open', 0);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    expect(questions.some((q) => /expected outcome/i.test(q.prompt))).toBe(true);
  });

  it('is deterministic: same input yields identical question set', () => {
    for (const type of TYPES) {
      for (const level of [0, 1] as VerifiabilityLevel[]) {
        expect(selectQuestions(type, level)).toEqual(selectQuestions(type, level));
      }
    }
  });

  it('every level 0/1 type yields 2 to 3 questions', () => {
    for (const type of TYPES) {
      for (const level of [0, 1] as VerifiabilityLevel[]) {
        const questions = selectQuestions(type, level);
        expect(questions.length).toBeGreaterThanOrEqual(2);
        expect(questions.length).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe('ask', () => {
  it('returns 2 to 3 questions for level 1', () => {
    const result = ask('feature', 1);
    expect(result.questions.length).toBeGreaterThanOrEqual(2);
    expect(result.questions.length).toBeLessThanOrEqual(3);
  });

  it('includes an expected-outcome question for level 0', () => {
    const result = ask('open', 0);
    expect(result.questions.some((q) => /expected outcome/i.test(q.prompt))).toBe(true);
  });

  it('declines with no questions at level 3', () => {
    const result = ask('bugfix', 3);
    expect(result.questions).toEqual<ClarifyingQuestion[]>([]);
  });

  it('declines with no questions at level 2', () => {
    const result = ask('feature', 2);
    expect(result.questions).toEqual<ClarifyingQuestion[]>([]);
  });

  it('is deterministic: same input yields identical result', () => {
    expect(ask('feature', 1)).toEqual(ask('feature', 1));
  });
});
