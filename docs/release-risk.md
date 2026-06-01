# Release Risk Assessment: Promo Engine v2

**Release**: v2.4.0
**QA owner**: Steven Leon
**Target deploy**: TBD
**Risk level**: **Medium-High**

## What's changing
- New tiered promo logic (loyalty multipliers)
- Stricter rate limiting on claim endpoint (5/min/user)
- New `expires_at` enforcement at claim time (was checked client-side only)
- Migration to add `tier` column on `promotions`

## Risk areas

### High risk
| Area | Risk | Mitigation |
|---|---|---|
| Backward compat with existing claims | Old promos lack `tier` column — could break GET /promos/active | Migration sets default `tier = 'standard'`; SQL test added (TC-SQL-004) |
| Rate limit accuracy | Over-aggressive limiting could lock out legitimate retries | Added boundary tests at 4/5/6 claims/min |
| Race condition on simultaneous claims | Two requests could both succeed before unique constraint fires | Confirmed unique constraint on (user_id, promotion_id) at DB level; added concurrent claim test |

### Medium risk
| Area | Risk | Mitigation |
|---|---|---|
| Timezone handling on expires_at | Server vs client time drift | Use UTC consistently; tested at expiry boundary ±1 sec |
| New tier multiplier math | Rounding errors on small bonuses | Added unit tests at $0.01, $0.99, $999.99 |

### Low risk
- UI copy changes (covered by visual regression)
- Logging additions (no functional impact)

## Test coverage

| Suite | Status | Notes |
|---|---|---|
| `tests/api/promos.spec.ts` | ✅ 18/18 | All endpoint variants |
| `tests/e2e/promo-claim.spec.ts` | ✅ 6/6 | Web + mobile viewports |
| `tests/sql/promo-integrity.spec.ts` | ✅ 4/4 | Including new tier column |
| Rate limit tests | ⏳ Pending env | Will run in staging only |

## Open questions
1. Should rate limit reset on tier upgrade? — pending Product
2. What's the rollback plan if migration fails midway? — confirmed with Eng: forward-only with `down` SQL

## Pre-release checklist
- [ ] All critical + regression tests green
- [ ] Migration tested on staging clone of prod
- [ ] Rate limit verified in staging
- [ ] Rollback SQL reviewed by Eng lead
- [ ] On-call rotation confirmed for 24h post-deploy
- [ ] Comms drafted for affected players if downtime

## Recommendation
**Conditional go**, pending rate limit verification in staging and on-call confirmation. Risk-adjusted confidence: 80%.
