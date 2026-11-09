import { defineConfig } from '@playwright/test';

const port = Number(process.env.RONIUM_PORT || 4173);
const baseURL = process.env.RONIUM_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    headless: true,
  },
  webServer: process.env.RONIUM_BASE_URL
    ? undefined
    : {
        command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
