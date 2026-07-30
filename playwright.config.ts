import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'on-failure' }]],
  use: {
    actionTimeout: 0,
    baseURL: 'https://test.getprudens.ai',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    headless: true
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/save-auth-state.spec.ts',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'smoke-public',
      testMatch: ['**/smoke/public.smoke.spec.ts', '**/smoke/auth.smoke.spec.ts'],
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'smoke-ai',
      testMatch: ['**/smoke/*-ai.smoke.spec.ts'],
      dependencies: ['setup'],
      timeout: 600 * 1000,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'storageState.json'
      }
    },
    {
      name: 'smoke-app',
      testMatch: ['**/smoke/*.smoke.spec.ts'],
      testIgnore: [
        '**/smoke/public.smoke.spec.ts',
        '**/smoke/auth.smoke.spec.ts',
        '**/smoke/*-ai.smoke.spec.ts'
      ],
      dependencies: ['setup'],
      timeout: 90 * 1000,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'storageState.json'
      }
    },
    {
      name: 'chromium',
      testIgnore: ['**/smoke/**'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'storageState.json'
      }
    }
  ]
});
