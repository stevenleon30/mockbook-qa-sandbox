import { test, expect } from '@playwright/test';

test.describe('Geolocation API @regression @critical', () => {
  for (const state of ['NJ', 'NY', 'FL']) {
    test(`GET /geo/check allows ${state}`, async ({ request }) => {
      const res = await request.get('/api/geo/check', { headers: { 'x-mock-state': state } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.state_code).toBe(state);
      expect(body.allowed).toBe(true);
    });
  }

  for (const state of ['CA', 'TX', 'WA']) {
    test(`GET /geo/check blocks ${state}`, async ({ request }) => {
      const res = await request.get('/api/geo/check', { headers: { 'x-mock-state': state } });
      const body = await res.json();
      expect(body.allowed).toBe(false);
    });
  }
});
