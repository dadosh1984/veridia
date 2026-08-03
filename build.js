import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const distDir = path.join(projectRoot, 'dist');

rmSync(distDir, { recursive: true, force: true });
execSync('npx tsc', { stdio: 'inherit', cwd: projectRoot });
