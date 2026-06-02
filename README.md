# MockBook QA Sandbox
![43 tests passing](docs/images/tests-passing.png)

A mini sportsbook app built to demonstrate Senior Manual QA Engineer skills: API testing, SQL validation, regression automation, Playwright, and AI-assisted QA workflows.

## What's tested
- **Auth**: signup, login, password reset, session expiry
- **Account**: profile updates, deposit limits, self-exclusion
- **Promotions**: bonus code claims, active promo display
- **Geolocation**: state-based access control (NJ, NY, FL allowed)

## Stack
- App: Next.js + Supabase (Postgres)
- E2E + API tests: Playwright (TypeScript)
- API exploration: Postman
- SQL validation: pg client + Playwright
- AI-assisted: Claude Code with custom SKILL.md

## Structure
```
docs/              Test strategy, test cases, release risk docs
tests/e2e/         End-to-end Playwright tests (tagged @smoke @regression @critical)
tests/api/         API regression tests
tests/sql/         SQL data-consistency assertions
tests/pages/       Page Object Models
tests/fixtures/    Shared test data and helpers
postman/           Postman collection + environment
supabase/          Schema migrations and seed data
scripts/           AI-assisted helpers (trace analyzer, test generator)
.claude/           Claude Code skill definitions
```

## Quick start
```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npx supabase db push
npm run dev                  # start app on :3000
npx playwright test          # run all tests
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

## Reports
- HTML: `npx playwright show-report`
- Email summary: `npm run report:email` (uses nodemailer)

## How I use AI in this workflow
See [docs/ai-assisted-qa.md](docs/ai-assisted-qa.md).
