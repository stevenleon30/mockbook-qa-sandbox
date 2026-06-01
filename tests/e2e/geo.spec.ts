import { test, expect } from '@playwright/test';

test.describe('Geo gating E2E @regression', () => {
  test('App responds to mock-state header at signup', async ({ page }) => {
    // Inject mock state via extra HTTP headers
    await page.setExtraHTTPHeaders({ 'x-mock-state': 'CA' });
    const res = await page.request.get('/api/geo/check');
    const body = await res.json();
    expect(body.allowed).toBe(false);
  });
});
