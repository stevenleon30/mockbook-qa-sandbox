import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/signup.page';
import { LoginPage } from '../pages/login.page';
import { AccountPage } from '../pages/account.page';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

test.describe('Self-exclusion E2E @regression @critical', () => {
  test('User self-excludes and is blocked from logging back in', async ({ page }) => {
    const email = uniqueEmail();
    await new SignupPage(page).open();
    await new SignupPage(page).signup(email, TEST_PASSWORD);
    await new LoginPage(page).open();
    await new LoginPage(page).login(email, TEST_PASSWORD);

    const account = new AccountPage(page);
    await account.open();
    page.once('dialog', d => d.accept()); // if you add a confirm dialog later
    await account.confirmSelfExclude();
    await account.expectExcluded();

    // Try to log in again
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    const login = new LoginPage(page);
    await login.open();
    await login.login(email, TEST_PASSWORD);
    await expect(login.message).toContainText(/self-excluded/);
  });
});
