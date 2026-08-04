import { emitKeypressEvents } from 'node:readline';

export interface SelectChoice<T> {
  value: T;
  label: string;
  selected?: boolean;
}

export interface CheckboxSelectOptions {
  input?: NodeJS.ReadableStream & { setRawMode?: (m: boolean) => void };
  output?: { write: (s: string) => void };
  readyDelayMs?: number;
}

export async function checkboxSelect<T>(
  choices: SelectChoice<T>[],
  options: CheckboxSelectOptions = {},
): Promise<T[]> {
  const input = (options.input ?? process.stdin) as NodeJS.ReadableStream & { setRawMode?: (m: boolean) => void };
  const output = options.output ?? { write: (s: string) => void process.stdout.write(s) };
  const readyAt = Date.now() + (options.readyDelayMs ?? 200);
  const selected = new Set<T>(choices.filter((c) => c.selected).map((c) => c.value));
  let cursor = 0;

  const render = (): void => {
    try {
      if (choices.length > 0) output.write(`\x1b[${choices.length}A\r`);
      for (let i = 0; i < choices.length; i++) {
        const checked = selected.has(choices[i].value) ? '[x]' : '[ ]';
        const mark = i === cursor ? '>' : ' ';
        output.write(`\x1b[2K\r${mark} ${checked} ${choices[i].label}\n`);
      }
    } catch {
      // render is decorative; never throw on closed streams
    }
  };

  return new Promise<T[]>((resolve) => {
    emitKeypressEvents(input);
    input.setRawMode?.(true);

    const cleanup = (): void => {
      input.off('keypress', onKey);
      input.setRawMode?.(false);
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve([...selected]);
    }, 120_000);

    const onKey = (_str: string, key: { name?: string }): void => {
      if (Date.now() < readyAt) {
        render();
        return;
      }
      const name = key?.name ?? '';
      if (name === 'up') {
        cursor = cursor > 0 ? cursor - 1 : choices.length - 1;
      } else if (name === 'down') {
        cursor = (cursor + 1) % Math.max(1, choices.length);
      } else if (name === 'space') {
        const value = choices[cursor].value;
        if (selected.has(value)) selected.delete(value);
        else selected.add(value);
      } else if (name === 'return' || name === 'enter') {
        clearTimeout(timeout);
        cleanup();
        resolve([...selected]);
        return;
      }
      render();
    };

    input.on('keypress', onKey);
    render();
  });
}
