import { describe, expect, it } from 'vitest';
import { shouldPrompt } from '../src/util/interactive.js';

describe('shouldPrompt', () => {
  const nonTty = () => ({ noInteractive: true, isTTY: false, env: {} });

  it('is true on an interactive TTY with a clean environment', () => {
    expect(shouldPrompt({ noInteractive: false, isTTY: true, env: {} })).toBe(true);
  });

  it('is false when stdin is not a TTY', () => {
    expect(shouldPrompt(nonTty())).toBe(false);
  });

  it('is false when CI is present in the environment', () => {
    expect(shouldPrompt({ noInteractive: false, isTTY: true, env: { CI: 'true' } })).toBe(false);
  });

  it('is false when VERIDIA_NO_INTERACTIVE is set', () => {
    expect(shouldPrompt({ noInteractive: false, isTTY: true, env: { VERIDIA_NO_INTERACTIVE: '1' } })).toBe(false);
  });

  it('is false when noInteractive is explicitly requested', () => {
    expect(shouldPrompt({ noInteractive: true, isTTY: true, env: {} })).toBe(false);
  });
});
