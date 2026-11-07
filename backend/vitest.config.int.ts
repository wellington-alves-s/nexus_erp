import { defineConfig } from 'vitest/config';

// Testes de integração: exigem um banco PostgreSQL dedicado (nome terminado em _test).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.int-spec.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://nexus:nexus@localhost:5432/nexus_erp_test?schema=public',
    },
  },
});
