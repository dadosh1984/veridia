import { execFileSync, type ExecFileSyncOptions } from 'node:child_process';

export function execFileWithShim(cmd: string, args: string[], options: ExecFileSyncOptions = {}): void {
  try {
    execFileSync(cmd, args, options);
    return;
  } catch (err) {
    if (process.platform === 'win32' && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      // npm .cmd/.ps1 shims need a shell. Pass the command line as one string so
      // Node does not warn about unescaped per-argument concatenation.
      execFileSync([cmd, ...args].join(' '), [], { ...options, shell: true });
      return;
    }
    throw err;
  }
}
