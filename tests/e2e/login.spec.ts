import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/signup.page';
import { LoginPage } from '../pages/login.page';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

test.describe('Login E2E @regression', () => {
  test('User can sign up then log in @smoke @critical', async ({ page }) => {
    const email = uniqueEmail();
    const signup = new SignupPage(page);
    await signup.open();
    await signup.signup(email, TEST_PASSWORD);
    await signup.expectSuccess(email);

    const login = new LoginPage(page);
    await login.open();
    await login.login(email, TEST_PASSWORD);
    await login.expectLoggedIn(email);
  });

  test('Wrong password shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login('nobody@nowhere.test', 'WrongPass123!');
    await expect(login.message).toContainText(/invalid/i);
  });
});
