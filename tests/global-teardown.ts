import { rmSync } from 'node:fs';
import path from 'node:path';
import { ROOT, compose } from './lib/stack';

export default async function globalTeardown() {
  // KEEP_STACK=1 leaves the test stack running so it can be inspected afterwards
  if (process.env.KEEP_STACK) return;
  compose('down', '-v');
  rmSync(path.join(ROOT, 'data-test'), { recursive: true, force: true });
}
