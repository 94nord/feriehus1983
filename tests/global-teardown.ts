import { rmSync } from 'node:fs';
import path from 'node:path';
import { ROD, compose } from './lib/stack';

export default async function globalTeardown() {
  // KEEP_STACK=1 lader testmiljøet køre, så man kan kigge på det bagefter
  if (process.env.KEEP_STACK) return;
  compose('down', '-v');
  rmSync(path.join(ROD, 'data-test'), { recursive: true, force: true });
}
