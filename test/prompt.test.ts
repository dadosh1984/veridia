import { describe, expect, it, vi } from 'vitest';
import { createInterface } from 'node:readline';
import { promptQuestions } from '../src/ask/prompt.js';

vi.mock('node:readline', () => {
  class FakeRL {
    question(_prompt: string, cb: (a: string) => void): void {
      setTimeout(() => cb('1'), 0);
    }
    close(): void {}
  }
  return { createInterface: vi.fn(() => new FakeRL()) };
});

describe('promptQuestions', () => {
  it('asks multiple questions with a single readline interface', async () => {
    const mock = vi.mocked(createInterface);
    mock.mockClear();
    const questions = [
      { id: 'a', prompt: 'A?', options: ['x', 'y'] },
      { id: 'b', prompt: 'B?', options: ['p', 'q'] },
    ];
    const answers = await promptQuestions(questions);
    expect(answers).toEqual({ a: 'x', b: 'p' });
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
