import { test, expect } from '@playwright/test';
import { harness } from '../../lib/testHarness';

test.describe('Harness smoke test @smoke', () => {
  test('raw SQL query works', async () => {
    const result = await harness.rawSql('select count(*) from accounts');
    expect(result.rows).toBeDefined();
    expect(result.rows[0]).toHaveProperty('count');
  });

  test('seed and delete a promo', async () => {
    await harness.seedPromo({
      code: 'TEST123',
      bonus_amount: 25,
      active: true,
    });

    const check = await harness.rawSql("select code from promotions where code = 'TEST123'");
    expect(check.rows.length).toBe(1);

    await harness.deletePromo('TEST123');

    const after = await harness.rawSql("select code from promotions where code = 'TEST123'");
    expect(after.rows.length).toBe(0);
  });

  test('reset a user removes their data', async () => {
    await harness.resetUser('qa+smoke@example.com');
    const result = await harness.rawSql(
      "select count(*) from accounts where email = 'qa+smoke@example.com'"
    );
    expect(parseInt(result.rows[0].count)).toBe(0);
  });
});