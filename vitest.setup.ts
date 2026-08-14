import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cliEntry = fileURLToPath(new URL('./dist/cli/index.mjs', import.meta.url));

if (!existsSync(cliEntry)) {
  execSync('npx tsdown', { stdio: 'inherit' });
}
