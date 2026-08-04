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
  const promise = checkboxSelect(choices, { input, output: stubOutput() as never, readyDelayMs: 0 });
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

  it('ignores a confirming enter received within the ready delay', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const input = new FakeInput();
      const promise = checkboxSelect(
        [
          { value: 'a', label: 'A', selected: true },
          { value: 'b', label: 'B' },
        ],
        { input, output: stubOutput() as never, readyDelayMs: 100 },
      );
      input.emit('keypress', '', { name: 'return' } as never); // in-window: must be ignored
      vi.advanceTimersByTime(100);
      input.emit('keypress', '', { name: 'down' } as never);
      input.emit('keypress', '', { name: 'space' } as never);
      input.emit('keypress', '', { name: 'return' } as never); // after ready: confirms
      await expect(promise).resolves.toEqual(['a', 'b']);
    } finally {
      vi.useRealTimers();
    }
  });
});
