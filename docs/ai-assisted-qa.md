# AI-Assisted QA Workflow

How I use Claude and other AI tools to make QA faster and more thorough — not to replace judgment, but to expand it.

## Where AI shows up in this project

### 1. Test case generation from requirements
**Tool**: Claude Code with `.claude/skill-generate-tests.md`
**Workflow**:
1. Drop a PRD or feature spec into the repo
2. Run `claude "generate test cases for docs/specs/new-feature.md"`
3. Claude reads the SKILL.md, follows the team's Gherkin format, and outputs `tests/cases/new-feature.md`
4. I review, refine, and commit. Saves ~60% of authoring time.

### 2. Playwright test scaffolding
**Tool**: Claude Code
**Workflow**: Given test cases, Claude scaffolds the Playwright spec with the right Page Object Model imports. I fill in the locator details after running the app.

### 3. Failed trace root-cause analysis
**Tool**: `scripts/analyze-trace.js`
**Workflow**: When a Playwright test fails:
1. CI uploads the trace
2. The script sends the trace metadata + failed step to Claude API
3. Claude returns a 3-line hypothesis: most likely cause, second most likely, and which logs to check
4. Pasted into the GitHub issue automatically

Catches obvious things (selector drift, timing, auth expiry) before a human looks.

### 4. SQL query generation from English
**Workflow**: "find all users in NJ who claimed WELCOME50 in the last 7 days" → Claude drafts the SQL, I review and add to `tests/sql/`.

### 5. Bug report writeup
**Workflow**: Paste console output + trace summary → Claude formats per our bug template (repro, expected, actual, severity rationale).

## Guardrails

- AI never commits code without a human PR review
- AI-generated SQL is run against staging clone first, never prod
- Trace analysis output is a hypothesis, not a verdict — I still verify
- I track which AI suggestions were correct vs wrong in `docs/ai-feedback-log.md` to calibrate trust

## Measured impact (last sprint)

| Metric | Before AI | With AI | Delta |
|---|---|---|---|
| Avg test case authoring time | 18 min | 7 min | -61% |
| Avg time to first-cause hypothesis on failure | 14 min | 3 min | -78% |
| Bug report writeup time | 12 min | 4 min | -67% |
| False-positive rate on AI hypotheses | n/a | 22% | acceptable |

## What I don't use AI for

- Risk assessments (judgment call, requires context)
- Test prioritization decisions
- Sign-off on release readiness
- Communicating bad news to engineering
