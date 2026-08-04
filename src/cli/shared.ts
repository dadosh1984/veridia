export const VALID_TYPES = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'] as const;
export const VALID_LEVELS = ['0', '1', '2', '3'] as const;

export function validateType(v: string): string | undefined {
  return VALID_TYPES.includes(v as typeof VALID_TYPES[number]) ? undefined : `invalid task type: ${v}`;
}

export function validateLevel(v: string | number): string | undefined {
  const s = String(v);
  return VALID_LEVELS.includes(s as typeof VALID_LEVELS[number]) ? undefined : `invalid verifiability level: ${v}`;
}

export function jsonOut(data: unknown): void {
  process.stdout.write(JSON.stringify(data) + '\n');
}
