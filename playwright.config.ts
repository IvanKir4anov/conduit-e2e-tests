import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;
// CI runs smoke and regression as separate steps; each writes its own reports.
const htmlReport = process.env.PW_HTML_REPORT ?? 'playwright-report';
const jsonReport = process.env.PW_JSON_REPORT ?? 'reports/results.json';

export default defineConfig({
  testDir: 'tests',
  globalSetup: './src/global-setup.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry in CI: a test that passes only on retry is reported as flaky, not hidden.
  retries: isCI ? 1 : 0,
  // The nightly run is strict: a flaky test fails it (see docs/stability.md).
  failOnFlakyTests: process.env.STRICT === '1',
  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: htmlReport }],
        ['github'],
        ['json', { outputFile: jsonReport }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: htmlReport }]],
  use: {
    baseURL: env.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
