import { test as base } from '@playwright/test';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const caps = {
    'build': 'playwright-build-' + Math.floor(Math.random() * 300),
    'browserstack.username': process.env.BROWSERSTACK_USERNAME,
    'browserstack.accessKey':process.env.BROWSERSTACK_ACCESS_KEY,
    'browser': 'playwright-firefox',  // allowed browsers are `chrome`, `edge`, `playwright-chromium`, `playwright-firefox` and `playwright-webkit`
    'os': 'osx',
    'os_version': 'Big Sur',
};

export const test = base.extend({
  
    page: async ({ page, playwright }, use, testInfo) => {
      
      // Use BrowserStack Launched Browser according to capabilities for cross-browser testing.
    //   if (testInfo.project.name.match(/browserstack/)) { // If any part of the project name outlined in the playwright.config.js file matches "browserstack", fall into this condition

    const vBrowser = await playwright.chromium.connect({ wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`,}); // I guess this is needed to connect to bstack cloud server??

    // I guess these next lines will create a Context and then create a new Page based on that context that we can then use???
    const vContext = await vBrowser.newContext(testInfo.project.use);
    const vPage = await vContext.newPage();
    await use(vPage);
    await vPage.close();
    await vBrowser.close();
      }
});