import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['./test/globalSetup.ts'],
    env: {
      DATABASE_URL: 'file:./test.db',
      LOG_LEVEL: 'silent',
    },
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
