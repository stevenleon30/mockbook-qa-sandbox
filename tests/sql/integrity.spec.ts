import { test, expect } from '@playwright/test';
import { harness } from '../../lib/testHarness';

test.describe('SQL data integrity @regression', () => {

  test('No orphan promo_claims @critical', async () => {
    const result = await harness.rawSql(`
      select count(*)::text as count from promo_claims pc
      left join promotions p on p.id = pc.promotion_id
      where p.id is null
    `);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('All self-excluded accounts have a timestamp @critical', async () => {
    const result = await harness.rawSql(`
      select count(*)::text as count from accounts
      where self_excluded = true and self_excluded_at is null
    `);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('Every active promotion has positive bonus_amount @critical', async () => {
    const result = await harness.rawSql(`
      select count(*)::text as count from promotions
      where active = true and bonus_amount <= 0
    `);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('No bets with non-positive stakes', async () => {
    const result = await harness.rawSql(
      "select count(*)::text as count from bets where stake <= 0"
    );
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('Promo codes are unique', async () => {
    const result = await harness.rawSql(`
      select count(*)::text as count from (
        select code from promotions group by code having count(*) > 1
      ) duplicates
    `);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

  test('All accounts have non-negative deposit limits', async () => {
    const result = await harness.rawSql(`
      select count(*)::text as count from accounts
      where deposit_limit_daily < 0
    `);
    expect(parseInt(result.rows[0].count)).toBe(0);
  });

});
