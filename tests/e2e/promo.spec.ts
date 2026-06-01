import { test } from '@playwright/test';
import { SignupPage } from '../pages/signup.page';
import { LoginPage } from '../pages/login.page';
import { PromosPage } from '../pages/promos.page';
import { uniqueEmail, TEST_PASSWORD, PROMO_CODES } from '../fixtures/data';

test.describe('Promo claim E2E @regression', () => {
  test('Logged-in user claims WELCOME50 @critical', async ({ page }) => {
    const email = uniqueEmail();
    await new SignupPage(page).open();
    await new SignupPage(page).signup(email, TEST_PASSWORD);

    const login = new LoginPage(page);
    await login.open();
    await login.login(email, TEST_PASSWORD);

    const promos = new PromosPage(page);
    await promos.open();
    await promos.claim(PROMO_CODES.WELCOME);
    await promos.expectClaimed(50);
  });

  test('User sees error claiming expired promo', async ({ page }) => {
    const email = uniqueEmail();
    await new SignupPage(page).open();
    await new SignupPage(page).signup(email, TEST_PASSWORD);
    await new LoginPage(page).open();
    await new LoginPage(page).login(email, TEST_PASSWORD);

    const promos = new PromosPage(page);
    await promos.open();
    await promos.claim(PROMO_CODES.EXPIRED);
    await promos.expectError(/expired/);
  });
});
