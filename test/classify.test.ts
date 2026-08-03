import { describe, expect, it } from 'vitest';
import { classify } from '../src/classify/classify.js';
import type { TaskType } from '../src/classify/types.js';

const corpus: Array<{ input: string; expected: TaskType }> = [
  { input: 'fix the null pointer in login', expected: 'bugfix' },
  { input: 'bug in the checkout flow', expected: 'bugfix' },
  { input: 'add dark mode support', expected: 'feature' },
  { input: 'implement pagination', expected: 'feature' },
  { input: 'write API docs for the auth module', expected: 'doc' },
  { input: 'document the configuration options', expected: 'doc' },
  { input: 'restructure the payment module', expected: 'refactor' },
  { input: 'refactor the database layer', expected: 'refactor' },
  { input: 'evaluate three database options', expected: 'explore' },
  { input: 'research caching strategies', expected: 'explore' },
  { input: 'help me with something', expected: 'open' },
];

describe('classify', () => {
  it.each(corpus)('classifies %s as $expected', ({ input, expected }) => {
    const result = classify(input);
    expect(result.type).toBe(expected);
  });

  it('returns a confidence between 0 and 1', () => {
    for (const { input } of corpus) {
      const result = classify(input);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic: same input yields same type and confidence', () => {
    for (const { input } of corpus) {
      expect(classify(input)).toEqual(classify(input));
    }
  });

  it('yields higher confidence for explicit bugfix signals than for the open fallback', () => {
    const explicit = classify('fix the null pointer in login');
    const fallback = classify('help me with something');
    expect(explicit.confidence).toBeGreaterThan(fallback.confidence);
  });
});
