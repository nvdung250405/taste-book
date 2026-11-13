import { defineConfig, devices } from '@playwright/test'

const external = process.env.BROWSER_BASE_URL
const baseURL = external || 'http://127.0.0.1:4178'
export default defineConfig({
  testDir: './tests/browser',
  outputDir: 'test-results',
  timeout: 30000,
  expect: { timeout: 10000 },
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'performance-results/browser-tests.json' }],
  ],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: external
    ? undefined
    : {
        command: 'node scripts/serve-dist.mjs',
        url: baseURL,
        env: { PORT: '4178' },
        reuseExistingServer: false,
        timeout: 15000,
      },
  projects: [
    {
      name: 'chrome-desktop',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chrome-mobile',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'edge-desktop',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'edge-mobile',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
        channel: 'msedge',
      },
    },
    {
      name: 'webkit-desktop',
      use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
})
