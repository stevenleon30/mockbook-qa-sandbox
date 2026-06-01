# Exploratory Charter: Promo Engine v2

**Charter ID**: EX-2024-12-PROMO-V2
**Tester**: Steven Leon
**Time-box**: 90 minutes
**Date**: TBD

## Mission
Investigate the new tiered promo engine for unexpected behavior around tier transitions, expiry edge cases, and concurrent claims, beyond what's covered by automated regression.

## Areas to explore
1. **Tier transition mid-claim** — what if a user qualifies for a higher tier while a claim is in flight?
2. **Expiry boundary** — claim a promo at expires_at ± 1 second
3. **Concurrent claims** — same user, same code, two devices, simultaneous POST
4. **Code case sensitivity** — does `welcome50` work? `Welcome50`?
5. **Whitespace handling** — `" WELCOME50 "` with leading/trailing spaces
6. **Unicode / injection** — `'; DROP TABLE promotions;--` as code
7. **Rate limit recovery** — what happens at the 6th claim attempt, then 60s later?
8. **Self-excluded user attempts claim** — should be blocked, but is it?

## Heuristics to apply
- **CRUD** — can I read, update, delete a claim?
- **Goldilocks** — too small (0.01), just right (50), too large (999999)
- **Followed by** — what happens after a successful claim? Account state? Email triggers?
- **Some, none, all** — claim none, claim one, claim every active promo

## Risks if not explored
- Compliance: claim duplication = financial loss
- Player trust: confusing error messages on legitimate retries
- Security: SQL injection or rate limit bypass

## Findings log
<!-- Fill in during the session -->
| Time | Observation | Defect filed? |
|---|---|---|
| | | |

## Outcome
<!-- Summary at end of session: bugs found, suggested new automated tests, gaps in coverage -->
