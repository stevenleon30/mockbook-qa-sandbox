import { test, expect } from '@playwright/test';
import { harness } from '../../lib/testHarness';
import { uniqueEmail, TEST_PASSWORD } from '../fixtures/data';

/**
 * These tests verify the data layer through the harness.
 * Accounts are created via the real signup UI (a quick browser flow)
 * because the harness setAccount is update-only.
 */
test.describe('Account data layer @regression', () => {

  async function createAccount(page: any, email: string) {
    await page.goto('/signup');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(TEST_PASSWORD);
    await page.getByTestId('signup-state').selectOption('NJ');
    await page.getByTestId('signup-submit').click();
    await page.waitForTimeout(1500); // wait for DB write
  }

  test('Account exists after signup @smoke @critical', async ({ page }) => {
    const email = uniqueEmail();
    await harness.resetUser(email);
    await createAccount(page, email);

    const result = await harness.rawSql(
      `select email, state_code from accounts where email = '${email}'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].state_code).toBe('NJ');

    await harness.resetUser(email);
  });

  test('setAccount updates deposit limit @critical', async ({ page }) => {
    const email = uniqueEmail();
    await harness.resetUser(email);
    await createAccount(page, email);

    await harness.setAccount({ email, deposit_limit_daily: 250 });

    const result = await harness.rawSql(
      `select deposit_limit_daily from accounts where email = '${email}'`
    );
    expect(parseFloat(result.rows[0].deposit_limit_daily)).toBe(250);

    await harness.resetUser(email);
  });

  test('Self-exclusion via harness sets both flag and timestamp @critical', async ({ page }) => {
    const email = uniqueEmail();
    await harness.resetUser(email);
    await createAccount(page, email);

    await harness.setAccount({ email, self_excluded: true });

    const result = await harness.rawSql(
      `select self_excluded, self_excluded_at from accounts where email = '${email}'`
    );
    expect(result.rows[0].self_excluded).toBe(true);
    expect(result.rows[0].self_excluded_at).not.toBeNull();

    await harness.resetUser(email);
  });

  test('resetUser removes account row', async ({ page }) => {
    const email = uniqueEmail();
    await createAccount(page, email);

    const before = await harness.rawSql(
      `select count(*)::text as count from accounts where email = '${email}'`
    );
    expect(parseInt(before.rows[0].count)).toBe(1);

    await harness.resetUser(email);

    const after = await harness.rawSql(
      `select count(*)::text as count from accounts where email = '${email}'`
    );
    expect(parseInt(after.rows[0].count)).toBe(0);
  });

});