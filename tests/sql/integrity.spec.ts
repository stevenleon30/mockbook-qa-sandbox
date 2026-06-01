import { test, expect } from '@playwright/test';
import { query, queryOne } from '../fixtures/db';
import { test as authTest } from '../fixtures/auth';
import { PROMO_CODES } from '../fixtures/data';

test.describe('SQL data integrity @regression', () => {
  test('No orphan promo_claims (every claim references valid promotion)', async () => {
    const rows = await query<{ count: string }>(`
      select count(*)::text as count from promo_claims pc
      left join promotions p on p.id = pc.promotion_id
      where p.id is null
    `);
    expect(parseInt(rows[0].count)).toBe(0);
  });

  test('No accounts without a matching auth user', async () => {
    const rows = await query<{ count: string }>(`
      select count(*)::text as count from accounts a
      left join auth.users u on u.id = a.user_id
      where u.id is null
    `);
    expect(parseInt(rows[0].count)).toBe(0);
  });

  test('All self-excluded accounts have a timestamp', async () => {
    const rows = await query<{ count: string }>(`
      select count(*)::text as count from accounts
      where self_excluded = true and self_excluded_at is null
    `);
    expect(parseInt(rows[0].count)).toBe(0);
  });

  test('Every active promotion has a positive bonus_amount', async () => {
    const rows = await query<{ count: string }>(`
      select count(*)::text as count from promotions
      where active = true and bonus_amount <= 0
    `);
    expect(parseInt(rows[0].count)).toBe(0);
  });

  test('No bets with non-positive stakes', async () => {
    const rows = await query<{ count: string }>(`
      select count(*)::text as count from bets where stake <= 0
    `);
    expect(parseInt(rows[0].count)).toBe(0);
  });
});

authTest.describe('SQL validation after API actions @critical', () => {
  authTest('Claiming a promo creates exactly one promo_claims row', async ({ api, authToken, authedEmail }) => {
    await api.post('/api/promos/claim', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { code: PROMO_CODES.WELCOME },
    });

    const row = await queryOne<{ user_email: string; promo_code: string; status: string }>(`
      select a.email as user_email, p.code as promo_code, pc.status
      from promo_claims pc
      join accounts a on a.user_id = pc.user_id
      join promotions p on p.id = pc.promotion_id
      where a.email = $1 and p.code = $2
    `, [authedEmail, PROMO_CODES.WELCOME]);

    expect(row).not.toBeNull();
    expect(row?.status).toBe('active');
  });

  authTest('Self-exclusion writes timestamp within 10 seconds of API call', async ({ api, authToken, authedEmail }) => {
    const before = new Date();
    await api.post('/api/account/self-exclude', { headers: { Authorization: `Bearer ${authToken}` } });
    const row = await queryOne<{ self_excluded: boolean; self_excluded_at: string }>(`
      select self_excluded, self_excluded_at from accounts where email = $1
    `, [authedEmail]);
    expect(row?.self_excluded).toBe(true);
    const delta = Date.now() - new Date(row!.self_excluded_at).getTime();
    expect(delta).toBeLessThan(10_000);
  });

  authTest('Updated deposit limit persists with correct value', async ({ api, authToken, authedEmail }) => {
    await api.post('/api/account/limit', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { deposit_limit_daily: 333.33 },
    });
    const row = await queryOne<{ deposit_limit_daily: string }>(`
      select deposit_limit_daily from accounts where email = $1
    `, [authedEmail]);
    expect(parseFloat(row!.deposit_limit_daily)).toBe(333.33);
  });
});
