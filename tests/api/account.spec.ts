import { test, expect } from '../fixtures/auth';

test.describe('Account API @regression', () => {
  test('GET /account returns own profile', async ({ api, authToken, authedEmail }) => {
    const res = await api.get('/api/account', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(authedEmail);
    expect(body.state_code).toBe('NJ');
  });

  test('GET /account 401 without token', async ({ api }) => {
    const res = await api.get('/api/account');
    expect(res.status()).toBe(401);
  });

  test('POST /account/limit updates deposit limit @critical', async ({ api, authToken }) => {
    const res = await api.post('/api/account/limit', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { deposit_limit_daily: 250 },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).deposit_limit_daily).toBe(250);
  });

  test('POST /account/limit rejects over max', async ({ api, authToken }) => {
    const res = await api.post('/api/account/limit', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { deposit_limit_daily: 50000 },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /account/limit rejects negative', async ({ api, authToken }) => {
    const res = await api.post('/api/account/limit', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { deposit_limit_daily: -1 },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /account/self-exclude sets flag @critical', async ({ api, authToken }) => {
    const res = await api.post('/api/account/self-exclude', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).self_excluded).toBe(true);
  });

  test('Self-excluded user cannot log in @critical', async ({ api, authToken, authedEmail }) => {
    await api.post('/api/account/self-exclude', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await api.post('/api/auth/login', {
      data: { email: authedEmail, password: 'TestPass123!' },
    });
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toMatch(/self-excluded/);
  });
});
