import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { test as base } from '@playwright/test';
// const base =  require('@playwright/test');
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();


/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
        name: 'chrome@latest:Windows 10@browserstack',
        use: {
          browserName: 'chromium',
          channel: 'chrome'
        },
    }
  ],
};

export default config;

const caps = {
    'build': 'playwright-build-' + Math.floor(Math.random() * 300),
    'browserstack.username': process.env.BROWSERSTACK_USERNAME,
    'browserstack.accessKey':process.env.BROWSERSTACK_ACCESS_KEY,
};

export const test = base.extend({
  
    page: async ({ page, playwright }, use, testInfo) => {
      
      // Use BrowserStack Launched Browser according to capabilities for cross-browser testing.
      if (testInfo.project.name.match(/browserstack/)) { // If any part of the project name outlined in the playwright.config.js file matches "browserstack", fall into this condition

        const vBrowser = await playwright.chromium.connect({ wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`,}); // I guess this is needed to connect to bstack cloud server??
  
        // I guess these next lines will create a Context and then create a new Page based on that context that we can then use???
        const vContext = await vBrowser.newContext(testInfo.project.use);
        const vPage = await vContext.newPage();
        await use(vPage);
        await vPage.close();
        await vBrowser.close();
      } else {
        use(page);
      }
    },
});