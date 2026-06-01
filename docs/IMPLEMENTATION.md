# Implementation Guide

Step-by-step to get MockBook running, tests passing, and the repo ready to share on LinkedIn.

## Day 1: Setup (1–2 hours)

### 1. Unzip and install
```bash
unzip mockbook-qa-sandbox.zip
cd mockbook-qa-sandbox
npm install
npx playwright install --with-deps
```

### 2. Set up Supabase
Two options:

**Option A — local Supabase (recommended for dev):**
```bash
npm install -g supabase
supabase init
supabase start          # spins up local Postgres on :54322
# Copy the printed URL, anon key, service role key into .env.local
supabase db push        # applies supabase/migrations/0001_init.sql
psql $DATABASE_URL -f supabase/seed.sql
```

**Option B — hosted Supabase (free tier):**
1. Create project at supabase.com
2. Project settings → API → copy URL, anon key, service role key
3. SQL Editor → paste contents of `supabase/migrations/0001_init.sql` → run
4. SQL Editor → paste contents of `supabase/seed.sql` → run
5. Project settings → Database → copy connection string into `DATABASE_URL`

### 3. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local with values from step 2
```

### 4. Start the app and verify
```bash
npm run dev
# Visit http://localhost:3000 — should see "Welcome to MockBook"
```

In another terminal:
```bash
curl http://localhost:3000/api/promos/active
# Should return JSON with WELCOME50 and RELOAD25
```

## Day 2: Run the tests (1 hour)

### 5. Run each suite individually
```bash
npm run test:api          # ~10s, no browser
npm run test:sql          # ~5s, hits DB directly
npm run test:smoke        # ~30s, browser
npm run test:e2e          # full E2E
npm run test              # everything
```

### 6. View reports
```bash
npx playwright show-report
```

### 7. Try the Postman collection
- Import `postman/MockBook.postman_collection.json`
- Run "Signup (NJ)" → "Login" (token auto-saves) → "Claim WELCOME50"

## Day 3: AI-assisted workflow (1 hour)

### 8. Test the trace analyzer
Intentionally break a test (change a selector in `tests/pages/login.page.ts`), run it, then:
```bash
node scripts/analyze-trace.js test-results/<failed-test>/error-context.md
```

You should see Claude's 3-line root-cause hypothesis.

### 9. Use Claude Code with the SKILL
From the repo root:
```bash
claude
> Read .claude/SKILL.md and generate test cases for a new feature: a "bonus history" endpoint that returns all promo_claims for the logged-in user, paginated 10 per page.
```

Review the generated cases, add a `tests/api/bonus-history.spec.ts`.

## Day 4: Polish and ship (2 hours)

### 10. File 5–10 fake bugs as GitHub Issues
Use the bug template at `.github/ISSUE_TEMPLATE/bug.md`. Examples:
- "Promo code accepts trailing whitespace" (Sev 3)
- "Self-exclusion not enforced on already-issued JWT" (Sev 2)
- "Active promos endpoint returns expired promos within 1s grace" (Sev 3)

These show hiring managers you think about edge cases and write good bug reports.

### 11. Push to GitHub
```bash
git init
git add .
git commit -m "Initial MockBook QA sandbox"
git remote add origin git@github.com:stevenleon30/mockbook-qa-sandbox.git
git push -u origin main
```

### 12. Configure GitHub secrets for CI
Repo → Settings → Secrets:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `REPORT_TO`
- `ANTHROPIC_API_KEY`

### 13. Write the LinkedIn post
Template (in your voice):

> Spent a week building a mini sportsbook and testing it the way I'd test a real one.
>
> MockBook covers what a Senior QA at any iGaming company actually owns: auth, account management, promotions, geolocation, self-exclusion. I built the app in Next.js + Supabase, then layered on what matters.
>
> What's in the repo:
> - Test strategy doc with risk assessment per feature
> - Test cases in Gherkin mapped to automated specs
> - Playwright suites tagged @smoke @regression @critical
> - API regression with Postman collection
> - SQL data-integrity tests hitting Postgres directly
> - AI-assisted test generation via Claude Code
> - Trace root-cause analysis script using Claude API
> - Release risk assessment template
> - Exploratory testing charter
>
> The thing I'm proudest of: every bullet in a Senior QA job description maps to a folder in this repo.
>
> Link in comments.

## Folder map (what to point to in interviews)

| When asked about... | Show them... |
|---|---|
| "How do you assess release risk?" | `docs/release-risk.md` |
| "Walk me through your test strategy" | `docs/test-strategy.md` |
| "How do you use AI in QA?" | `docs/ai-assisted-qa.md` + `scripts/analyze-trace.js` |
| "Show me a Playwright test" | `tests/api/promos.spec.ts` (tagged, parameterized) |
| "Do you write SQL?" | `tests/sql/integrity.spec.ts` |
| "How do you organize Playwright?" | `tests/pages/` (POM) + `tests/fixtures/` |
| "How do you handle flaky tests?" | playwright.config.ts (retain-on-failure) + bug template |
| "Postman or code?" | Both — `postman/` + `tests/api/` |

## Common gotchas

- **`@/` imports fail**: ensure `next.config.js` and `tsconfig.json` paths are correct
- **Supabase email confirm**: in hosted Supabase, disable "Confirm email" in Auth settings, or signup tests will hang
- **`DATABASE_URL` for SQL tests**: must be the direct Postgres connection string, not the Supabase REST URL
- **Playwright on M1 Mac**: `npx playwright install --with-deps` may need rosetta for some browsers
