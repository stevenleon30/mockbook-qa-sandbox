import { test, expect } from '@playwright/test';
import { harness } from '../../lib/testHarness';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

test.describe('Auth data layer @regression', () => {

  test('Signup persists account row with correct state @smoke @critical', async ({ page }) => {
    const email = uniqueEmail();
    await harness.resetUser(email);

    await page.goto('/signup');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(TEST_PASSWORD);
    await page.getByTestId('signup-state').selectOption('NJ');
    await page.getByTestId('signup-submit').click();
    await page.waitForTimeout(1500);

    const result = await harness.rawSql(
      `select email, state_code from accounts where email = '${email}'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].state_code).toBe('NJ');

    await harness.resetUser(email);
  });

  test('Blocked state does NOT create account @critical', async ({ page }) => {
    const email = uniqueEmail();
    await harness.resetUser(email);

    await page.goto('/signup');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(TEST_PASSWORD);
    await page.getByTestId('signup-state').selectOption('CA');
    await page.getByTestId('signup-submit').click();
    await page.waitForTimeout(1500);

    const result = await harness.rawSql(
      `select count(*)::text as count from accounts where email = '${email}'`
    );
    expect(parseInt(result.rows[0].count)).toBe(0);

    await harness.resetUser(email);
  });

});