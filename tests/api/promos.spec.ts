import { test, expect } from '../fixtures/auth';
import { harness } from '../../lib/testHarness';
import { PROMO_CODES } from '../fixtures/data';

test.describe('Promos data layer @regression', () => {

  test.beforeAll(async () => {
    // Ensure baseline seed promos exist in the database
    await harness.seedPromo({
      code: PROMO_CODES.WELCOME,
      bonus_amount: 50,
      active: true,
    });
    await harness.seedPromo({
      code: PROMO_CODES.RELOAD,
      bonus_amount: 25,
      active: true,
    });
    await harness.seedPromo({
      code: PROMO_CODES.EXPIRED,
      bonus_amount: 10,
      active: true,
      expires_at: '2020-01-01T00:00:00Z', // already past
    });
    await harness.seedPromo({
      code: PROMO_CODES.INACTIVE,
      bonus_amount: 99,
      active: false,
    });
  });

  test('Active promos exist in the database @smoke', async () => {
    const result = await harness.rawSql(
      "select code from promotions where active = true and (expires_at is null or expires_at > now())"
    );
    const codes = result.rows.map((r: any) => r.code);
    expect(codes).toContain(PROMO_CODES.WELCOME);
    expect(codes).toContain(PROMO_CODES.RELOAD);
  });

  test('Expired promos are filtered out of active query', async () => {
    const result = await harness.rawSql(
      "select code from promotions where active = true and expires_at > now()"
    );
    const codes = result.rows.map((r: any) => r.code);
    expect(codes).not.toContain(PROMO_CODES.EXPIRED);
  });

  test('Inactive promos are filtered out of active query', async () => {
    const result = await harness.rawSql(
      "select code from promotions where active = true"
    );
    const codes = result.rows.map((r: any) => r.code);
    expect(codes).not.toContain(PROMO_CODES.INACTIVE);
  });

  test('Seeded promo has correct bonus amount @critical', async () => {
    const result = await harness.rawSql(
      `select bonus_amount from promotions where code = '${PROMO_CODES.WELCOME}'`
    );
    expect(result.rows.length).toBe(1);
    expect(parseFloat(result.rows[0].bonus_amount)).toBe(50);
  });

  test('Promo codes are unique @critical', async () => {
    const result = await harness.rawSql(
      "select code, count(*) as cnt from promotions group by code having count(*) > 1"
    );
    expect(result.rows.length).toBe(0);
  });

  test('All active promos have positive bonus_amount @critical', async () => {
    const result = await harness.rawSql(
      "select count(*) as cnt from promotions where active = true and bonus_amount <= 0"
    );
    expect(parseInt(result.rows[0].cnt)).toBe(0);
  });

});
