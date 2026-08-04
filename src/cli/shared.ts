export const VALID_TYPES = ['bugfix', 'refactor', 'feature', 'doc', 'explore', 'open'] as const
export const VALID_LEVELS = ['0', '1', '2', '3'] as const

/**
 * Validate that a string is a valid TaskType.
 *
 * @param v - The value to validate.
 * @returns An error message string if invalid, or undefined if valid.
 */
export function validateType(v: string): string | undefined {
  return VALID_TYPES.includes(v as (typeof VALID_TYPES)[number]) ? undefined : `invalid task type: ${v}`
}

/**
 * Validate that a value is a valid VerifiabilityLevel (0-3).
 *
 * @param v - The value to validate (string or number).
 * @returns An error message string if invalid, or undefined if valid.
 */
export function validateLevel(v: string | number): string | undefined {
  const s = String(v)
  return VALID_LEVELS.includes(s as (typeof VALID_LEVELS)[number]) ? undefined : `invalid verifiability level: ${v}`
}

/**
 * Write a JSON-serialized value to stdout followed by a newline.
 *
 * @param data - The data to serialize and output.
 */
export function jsonOut(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data)}\n`)
}
