# MockBook Test Strategy

## Purpose
Define how we ensure quality across MockBook's critical player journeys: authentication, account management, promotions, and geolocation. This document is the single source of truth for what we test, how often, and at what depth.

## Scope
| In scope | Out of scope |
|---|---|
| Web app (Next.js) | Native mobile apps |
| REST API endpoints | Third-party payment processors (mocked) |
| Postgres data integrity | Load/performance testing |
| Geolocation gating logic | Real IP-based geo (we override via header) |
| Self-exclusion + responsible gaming flags | KYC document verification |

## Risk assessment by feature

| Feature | Player impact | Regulatory risk | Test depth |
|---|---|---|---|
| Authentication | Critical — blocks all access | Medium | Full regression every release |
| Self-exclusion | Critical — RG compliance | **High** | Full regression + manual sign-off |
| Geolocation gate | Critical — legal exposure | **High** | Full regression + boundary cases |
| Promotion claims | High — revenue + fairness | Medium | Full regression |
| Deposit limits | High — RG compliance | High | Full regression |
| Account profile edits | Medium | Low | Smoke per release |

## Test pyramid

```
        /\        Manual exploratory + UAT (5%)
       /  \
      /----\      E2E Playwright (15%)
     /      \
    /--------\    API + Integration (40%)
   /          \
  /------------\  Unit tests (40% — owned by Engineering)
```

QA owns the top three layers. We tag E2E tests with `@smoke` (runs in PR), `@regression` (runs nightly), and `@critical` (runs pre-release and blocks deploy if failing).

## Test types and when we run them

| Type | Trigger | Suite |
|---|---|---|
| Smoke | Every PR | `npm run test:smoke` |
| API regression | Every PR | `npm run test:api` |
| SQL data-consistency | Every PR | `npm run test:sql` |
| Full E2E regression | Nightly + pre-release | `npm run test:regression` |
| Critical journey | Pre-deploy | `npm run test:critical` |
| Exploratory | Per feature | Charter-based, logged in `docs/exploratory-charters/` |

## Environments

| Env | Purpose | Data |
|---|---|---|
| Local | Dev + test authoring | Seeded |
| QA | Full regression | Daily reset, seeded |
| Staging | Pre-release UAT | Production-like, sanitized |
| Production | Live | Real users |

## Defect management

- **Sev 1** (blocks login, payments, RG controls): immediate, deploy block
- **Sev 2** (major feature broken, workaround exists): fix this sprint
- **Sev 3** (minor functional, UI): backlog
- **Sev 4** (cosmetic, copy): backlog

Bug template lives at `.github/ISSUE_TEMPLATE/bug.md`.

## Tooling

| Need | Tool |
|---|---|
| API exploration | Postman, Swagger |
| API regression | Playwright (request fixture) |
| Network inspection | Charles Proxy, DevTools |
| Mobile emulation | Playwright device emulation |
| DB validation | psql, Playwright + pg |
| Test data generation | Faker, custom factories |
| AI-assisted test authoring | Claude Code with `.claude/SKILL.md` |
| Trace root-cause analysis | `scripts/analyze-trace.js` (Claude API) |

## Release readiness checklist

Before any release:
- [ ] All `@critical` tests pass
- [ ] All `@regression` tests pass (or known-failing documented)
- [ ] SQL data-consistency suite passes
- [ ] Manual exploratory charter completed for new features
- [ ] Risk assessment doc updated in `docs/release-risk-<version>.md`
- [ ] No Sev 1 or Sev 2 defects open

## Continuous improvement

QA retrospective every 2 weeks. We track:
- Defect escape rate (bugs found in prod / total bugs)
- Test execution time (target: smoke < 5 min, regression < 30 min)
- Flake rate (target: < 2%)
- AI-assisted test authoring time savings (measured per sprint)
