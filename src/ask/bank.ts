import type { TaskType } from '../classify/types.js';
import type { ClarifyingQuestion } from './types.js';

const EXPECTED_OUTCOME: ClarifyingQuestion = {
  id: 'expected-outcome',
  prompt: 'What is the expected outcome?',
  options: ['A concrete deliverable', 'An answer or recommendation', 'A code change with tests', 'Undefined - explore'],
};

const bank: Record<TaskType, ClarifyingQuestion[]> = {
  bugfix: [
    {
      id: 'repro',
      prompt: 'Can you provide the failing input or reproducer?',
      options: ['Yes, exact reproducer', 'Approximate steps', 'No, unknown trigger'],
    },
    {
      id: 'expected-vs-actual',
      prompt: 'What is the expected vs actual behavior?',
      options: ['Crash / error message', 'Wrong output', 'Performance issue', 'Not sure yet'],
    },
  ],
  refactor: [
    {
      id: 'goal',
      prompt: 'What is the refactoring goal?',
      options: ['Readability', 'Performance', 'Remove duplication', 'Prepare for a feature'],
    },
    {
      id: 'behavior-preserved',
      prompt: 'Must behavior stay exactly the same?',
      options: ['Yes, no behavior change', 'Minor changes allowed', 'Behavior may improve'],
    },
  ],
  feature: [
    {
      id: 'acceptance',
      prompt: 'What are the acceptance criteria?',
      options: ['I have explicit criteria', 'Rough idea', 'Undefined - decide for me'],
    },
    {
      id: 'scope',
      prompt: 'What is the scope of this feature?',
      options: ['Small, single module', 'Medium, cross-module', 'Large, unknown'],
    },
  ],
  doc: [
    {
      id: 'audience',
      prompt: 'Who is the documentation for?',
      options: ['End users', 'Developers', 'Both'],
    },
    {
      id: 'format',
      prompt: 'What format or location?',
      options: ['README', 'Inline comments', 'Dedicated docs site', 'Unspecified'],
    },
  ],
  explore: [
    {
      id: 'criteria',
      prompt: 'What are the evaluation criteria?',
      options: ['I have explicit criteria', 'Cost-driven', 'Performance-driven', 'Unknown'],
    },
    {
      id: 'output-form',
      prompt: 'What output do you need?',
      options: ['Written comparison', 'Recommendation', 'Prototype', 'Undefined'],
    },
  ],
  open: [
    {
      id: 'direction',
      prompt: 'What direction should this take?',
      options: ['I have an idea', 'Help me brainstorm', 'Pick something sensible'],
    },
  ],
};

export const QUESTION_BANK: Record<TaskType, ClarifyingQuestion[]> = bank;

export const EXPECTED_OUTCOME_QUESTION: ClarifyingQuestion = EXPECTED_OUTCOME;
