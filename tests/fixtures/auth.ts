import { test as base, APIRequestContext } from '@playwright/test';
import { uniqueEmail } from './data';
import { harness } from '../../lib/testHarness';

type Fixtures = {
  api: APIRequestContext;
  testEmail: string;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL });
    await use(ctx);
    await ctx.dispose();
  },
  testEmail: async ({}, use) => {
    const email = uniqueEmail();
    // Reset before to ensure clean state
    await harness.resetUser(email);
    await use(email);
    // Reset after to clean up
    await harness.resetUser(email);
  },
});

export { expect } from '@playwright/test';
