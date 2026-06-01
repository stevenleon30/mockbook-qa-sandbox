# MockBook Test Cases

Test cases written in Gherkin for readability. Each maps to one or more automated tests in `tests/`.

## Authentication

### TC-AUTH-001: New user signup from allowed state
```
Given I am on the signup page
When I enter a valid email and password
And I select state "NJ"
And I click Sign up
Then I see "Account created for <email>"
And a row exists in accounts table with my user_id and state_code = "NJ"
```
Maps to: `tests/e2e/auth.spec.ts > signup happy path`, `tests/api/auth.spec.ts > POST /signup 200`

### TC-AUTH-002: Signup blocked from non-allowed state
```
Given I am on the signup page
When I enter valid credentials and select state "CA"
Then I receive a 403 error "state CA not permitted"
And no account row is created
```
Maps to: `tests/api/auth.spec.ts > POST /signup blocked state`

### TC-AUTH-003: Password below minimum length
```
When I submit signup with password "short"
Then I receive 400 "password must be at least 8 characters"
```

### TC-AUTH-004: Login with correct credentials
```
Given a user exists with email "test@x.com"
When I POST /api/auth/login with correct password
Then I receive 200 with a JWT token
```

### TC-AUTH-005: Login with wrong password
```
When I POST /api/auth/login with wrong password
Then I receive 401 "invalid credentials"
```

### TC-AUTH-006: Self-excluded user cannot log in
```
Given user "x@y.com" has self_excluded = true in accounts
When the user attempts to log in
Then login returns 403 "account self-excluded"
```

## Account management

### TC-ACCT-001: Update deposit limit within bounds
```
Given I am logged in
When I POST /api/account/limit with { deposit_limit_daily: 250 }
Then the accounts row reflects deposit_limit_daily = 250
```

### TC-ACCT-002: Deposit limit cannot exceed $10,000
```
When I POST /api/account/limit with { deposit_limit_daily: 50000 }
Then I receive 400 "limit cannot exceed 10000"
```

### TC-ACCT-003: Deposit limit cannot be negative
```
When I POST /api/account/limit with { deposit_limit_daily: -10 }
Then I receive 400 "invalid limit"
```

### TC-ACCT-004: Self-exclusion persists and timestamps
```
Given I am logged in
When I POST /api/account/self-exclude
Then accounts.self_excluded = true
And accounts.self_excluded_at is within the last minute
```

## Promotions

### TC-PROMO-001: Claim valid active promo code
```
Given promo "WELCOME50" is active
When I POST /api/promos/claim with code "WELCOME50"
Then I receive 200 with bonus_amount = 50
And one row exists in promo_claims for my user_id
```

### TC-PROMO-002: Cannot claim expired promo
```
When I claim "EXPIRED10"
Then I receive 400 "promo expired"
```

### TC-PROMO-003: Cannot claim inactive promo
```
When I claim "INACTIVE99"
Then I receive 400 "promo inactive"
```

### TC-PROMO-004: Cannot claim same promo twice
```
Given I have already claimed "WELCOME50"
When I claim it again
Then I receive 409 "already claimed"
```

### TC-PROMO-005: Active promos list excludes expired and inactive
```
When I GET /api/promos/active
Then the response contains "WELCOME50" and "RELOAD25"
And does not contain "EXPIRED10" or "INACTIVE99"
```

## Geolocation

### TC-GEO-001: Allowed state returns allowed=true
```
When I GET /api/geo/check with header x-mock-state = "NJ"
Then response is { state_code: "NJ", allowed: true }
```

### TC-GEO-002: Blocked state returns allowed=false
```
When I GET /api/geo/check with header x-mock-state = "CA"
Then response is { state_code: "CA", allowed: false }
```

### TC-GEO-003: All three allowed states permit access
```
For each state in [NJ, NY, FL]:
  GET /api/geo/check returns allowed: true
```

## Data consistency (SQL)

### TC-SQL-001: Every promo_claim references a valid promotion
```
select count(*) from promo_claims pc
left join promotions p on p.id = pc.promotion_id
where p.id is null;
Expected: 0
```

### TC-SQL-002: No account exists without a matching auth user
```
select count(*) from accounts a
left join auth.users u on u.id = a.user_id
where u.id is null;
Expected: 0
```

### TC-SQL-003: All self-excluded accounts have a timestamp
```
select count(*) from accounts
where self_excluded = true and self_excluded_at is null;
Expected: 0
```
