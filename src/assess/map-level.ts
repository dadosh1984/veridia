import type { Oracle, VerifiabilityLevel } from './types.js';

const NON_DETERMINISTIC_HINTS = new Set(['explore', 'open']);

export function mapLevel(oracles: Oracle[], taskHint?: string): VerifiabilityLevel {
  const kinds = new Set(oracles.map((o) => o.kind));
  if (kinds.size === 0) return 1;

  const deterministic = taskHint === undefined || !NON_DETERMINISTIC_HINTS.has(taskHint);
  if (kinds.has('test-runner') && deterministic) return 3;

  return 2;
}
