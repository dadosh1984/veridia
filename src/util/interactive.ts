export interface PromptResolve {
  noInteractive?: boolean;
  isTTY?: boolean;
  env?: NodeJS.ProcessEnv;
}

export function shouldPrompt(options: PromptResolve = {}): boolean {
  if (options.noInteractive === true) return false;
  const env = options.env ?? process.env;
  const isTTY = options.isTTY ?? !!process.stdin.isTTY;
  if (env.VERIDIA_NO_INTERACTIVE === '1') return false;
  if ('CI' in env) return false;
  return isTTY;
}
