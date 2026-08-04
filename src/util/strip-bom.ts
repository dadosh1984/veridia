/**
 * Strip the UTF-8 BOM (byte order mark) from the beginning of a string if present.
 *
 * @param text - The input string that may contain a BOM.
 * @returns The string with the BOM removed (or unchanged if no BOM was present).
 */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}
