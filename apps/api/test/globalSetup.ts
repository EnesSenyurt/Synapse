import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

export default function setup() {
  const testDb = resolve(process.cwd(), 'prisma/test.db');
  try {
    rmSync(testDb, { force: true });
  } catch {
    // ignore
  }

  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}
