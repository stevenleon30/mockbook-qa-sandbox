import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

if (!process.env.BASE_URL) {
  console.warn('⚠️  BASE_URL not set in .env.local — defaulting to localhost:3000');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'sql',
      testDir: './tests/sql',
    },
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-mobile',
      testDir: './tests/e2e',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // Removed webServer block — we don't need a local server, we use Lovable
});
