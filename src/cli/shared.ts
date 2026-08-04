export const VALID_TYPES = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'] as const;
export const VALID_LEVELS = ['0', '1', '2', '3'] as const;

export function parseFlags(flags: string[], expected: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < flags.length; i++) {
    const f = flags[i];
    if (expected.includes(f)) {
      result[f] = flags[++i];
      if (result[f] === undefined) return result;
    } else {
      result._error = `unknown argument: ${f}`;
      return result;
    }
  }
  return result;
}

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
