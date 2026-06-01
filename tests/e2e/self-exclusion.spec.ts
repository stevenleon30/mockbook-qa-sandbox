import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/signup.page';
import { LoginPage } from '../pages/login.page';
import { AccountPage } from '../pages/account.page';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

test.describe('Self-exclusion E2E @regression @critical', () => {
  test('User self-excludes and is blocked from logging back in', async ({ page }) => {
    const email = uniqueEmail();
    const signup = new SignupPage(page);
    await signup.open();
    await signup.signup(email, TEST_PASSWORD);
    await signup.expectSuccess(email);

    const login = new LoginPage(page);
    await login.open();
    await login.login(email, TEST_PASSWORD);
    await login.expectLoggedIn(email);

    const account = new AccountPage(page);
    await account.open();
    page.once('dialog', d => d.accept()); // if you add a confirm dialog later
    await account.confirmSelfExclude();
    await account.expectExcluded();

    // Try to log in again
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    const relogin = new LoginPage(page);
    await relogin.open();
    await relogin.login(email, TEST_PASSWORD);
    await expect(relogin.message).toContainText(/self-excluded/);
  });
});
