import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/signup.page';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

test.describe('Signup E2E @regression', () => {
  test('User signs up from NJ successfully @smoke @critical', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.open();
    const email = uniqueEmail();
    await signup.signup(email, TEST_PASSWORD, 'NJ');
    await signup.expectSuccess(email);
  });

  test('User from CA is blocked at signup @critical', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.open();
    await signup.signup(uniqueEmail(), TEST_PASSWORD, 'CA');
    await signup.expectError(/not permitted/);
  });

  test('Signup shows error for weak password', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.open();
    await signup.signup(uniqueEmail(), 'weak', 'NJ');
    await signup.expectError(/8 characters/);
  });
});
