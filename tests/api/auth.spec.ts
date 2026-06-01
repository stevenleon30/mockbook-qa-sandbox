import { test, expect } from '@playwright/test';
import { uniqueEmail, TEST_PASSWORD, BLOCKED_STATES, ALLOWED_STATES } from '../fixtures/data';

test.describe('Auth API @regression @critical', () => {
  test('POST /signup creates user from allowed state', async ({ request }) => {
    const email = uniqueEmail();
    const res = await request.post('/api/auth/signup', {
      data: { email, password: TEST_PASSWORD, state_code: 'NJ' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(email);
    expect(body.state_code).toBe('NJ');
    expect(body.id).toBeTruthy();
  });

  for (const state of BLOCKED_STATES) {
    test(`POST /signup blocked from ${state} @critical`, async ({ request }) => {
      const res = await request.post('/api/auth/signup', {
        data: { email: uniqueEmail(), password: TEST_PASSWORD, state_code: state },
      });
      expect(res.status()).toBe(403);
      expect((await res.json()).error).toMatch(/not permitted/);
    });
  }

  test('POST /signup rejects password under 8 chars', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: uniqueEmail(), password: 'short', state_code: 'NJ' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /signup rejects missing email', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { password: TEST_PASSWORD, state_code: 'NJ' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /login returns JWT on success @smoke', async ({ request }) => {
    const email = uniqueEmail();
    await request.post('/api/auth/signup', {
      data: { email, password: TEST_PASSWORD, state_code: 'NJ' },
    });
    const res = await request.post('/api/auth/login', {
      data: { email, password: TEST_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.email).toBe(email);
  });

  test('POST /login 401 on wrong password', async ({ request }) => {
    const email = uniqueEmail();
    await request.post('/api/auth/signup', {
      data: { email, password: TEST_PASSWORD, state_code: 'NJ' },
    });
    const res = await request.post('/api/auth/login', {
      data: { email, password: 'WrongPass123!' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /login 401 on non-existent user', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'nobody@nowhere.test', password: TEST_PASSWORD },
    });
    expect(res.status()).toBe(401);
  });
});
