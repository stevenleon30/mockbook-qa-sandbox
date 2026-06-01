import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const BASE = process.env.BASE_URL;
const TOKEN = process.env.TEST_HARNESS_TOKEN;

if (!BASE) {
  throw new Error('BASE_URL is not set. Check .env.local exists in project root and contains BASE_URL=https://...');
}
if (!TOKEN) {
  throw new Error('TEST_HARNESS_TOKEN is not set. Check .env.local exists in project root.');
}

async function call(apiPath: string, body: unknown) {
  const res = await fetch(`${BASE}${apiPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-token": TOKEN,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${apiPath} → ${res.status} ${await res.text()}`);
  return res.json();
}

export const harness = {
  resetUser: (email: string) => call("/api/test/reset-user", { email }),
  seedPromo: (p: { code: string; bonus_amount: number; active?: boolean; expires_at?: string }) =>
    call("/api/test/seed-promo", p),
  deletePromo: (code: string) => call("/api/test/delete-promo", { code }),
  rawSql: (sql: string) => call("/api/test/raw-sql", { sql }),
  setAccount: (p: { email: string; self_excluded?: boolean; deposit_limit_daily?: number }) =>
    call("/api/test/set-account", p),
};