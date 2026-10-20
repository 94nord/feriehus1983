import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ENV_FIL = path.join(ROD, 'tests/.env.test');
export const BASE_URL = 'http://localhost:8080';
export const ADMIN_URL = 'http://admin.localhost:8080';

const COMPOSE = [
  'compose',
  '-p', 'feriehus1983-test',
  '-f', 'docker-compose.yml',
  '-f', 'docker-compose.test.yml',
  '--env-file', ENV_FIL,
];

export function compose(...args: string[]) {
  return execFileSync('docker', [...COMPOSE, ...args], { cwd: ROD, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

export async function ventPaa(url: string, sekunder = 120) {
  const slut = Date.now() + sekunder * 1000;
  while (Date.now() < slut) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // ikke klar endnu
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${url} svarede ikke inden for ${sekunder} sekunder`);
}
