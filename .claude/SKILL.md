# SKILL: Generate QA artifacts for MockBook

When Steven asks you to generate test cases, test code, or bug reports for MockBook, follow this skill.

## Test case generation

Format: Gherkin (Given / When / Then), grouped by feature. Map each case to the test file it will live in.

Template:
```
### TC-<AREA>-<NUM>: <short title>
\`\`\`
Given <preconditions>
When <action>
Then <observable outcome>
And <DB-level assertion if applicable>
\`\`\`
Maps to: tests/<path>/<file>.spec.ts > <test name>
```

Always include:
- Happy path
- Each documented error case (400, 401, 403, 404, 409)
- Boundary cases for any numeric input
- One concurrency / race condition case if the endpoint writes data
- One DB-consistency assertion using a SQL query

## Playwright test scaffolding

- Use TypeScript, `@playwright/test`, the existing Page Object pattern in `tests/pages/`
- Import shared fixtures from `tests/fixtures/auth.ts` for authenticated tests
- Use `data-testid` selectors only — never CSS classes or XPath
- Tag every test with at least one of `@smoke`, `@regression`, `@critical`
- Negative tests check both status code AND error message shape

## SQL validation

- Place new queries in `tests/sql/<feature>.spec.ts`
- Always assert against `count(*)` for integrity checks, not row presence
- Parameterize with `$1, $2` — never string-interpolate

## Bug reports

Template at `.github/ISSUE_TEMPLATE/bug.md`. Always include:
- Severity (1-4) with one-line justification
- Repro steps numbered
- Expected vs actual
- Environment + build SHA
- Attached: trace, screenshot, console log
- Suggested next step (who to ping, what to check)

## Trace analysis

When given a Playwright trace summary, return at most:
1. Most likely root cause (1 sentence)
2. Second most likely (1 sentence)
3. Three log files or DB tables to check (bulleted)

Do not speculate beyond what the trace shows.
