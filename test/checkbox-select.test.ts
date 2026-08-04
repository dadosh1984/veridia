import { describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'node:events';
import { checkboxSelect } from '../src/prompts/checkbox-select.js';

vi.mock('node:readline', () => ({ emitKeypressEvents: vi.fn() }));

class FakeInput extends EventEmitter {
  setRawMode = vi.fn();
}

function stubOutput() {
  return { write: () => true };
}

async function runSelect(choices: Array<{ value: string; label: string; selected?: boolean }>, keys: Array<{ name?: string }>) {
  const input = new FakeInput();
  const promise = checkboxSelect(choices, { input, output: stubOutput() as never });
  for (const key of keys) {
    input.emit('keypress', '', key as never);
  }
  return promise;
}

describe('checkboxSelect', () => {
  it('toggling with space and confirming with return returns selected values', async () => {
    const result = await runSelect(
      [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C', selected: true },
      ],
      [
        { name: 'down' },
        { name: 'space' },
        { name: 'down' },
        { name: 'space' },
        { name: 'return' },
      ],
    );
    expect([...result].sort()).toEqual(['b']);
  });

  it('holds pre-selected choices when nothing is toggled', async () => {
    const result = await runSelect(
      [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', selected: true },
      ],
      [{ name: 'return' }],
    );
    expect(result).toEqual(['b']);
  });
});
