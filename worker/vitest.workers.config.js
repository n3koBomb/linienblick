import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    pool: '@cloudflare/vitest-pool-workers',
    include: ['src/**/*.worker.test.js'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.local.jsonc' },
      },
    },
  },
});
