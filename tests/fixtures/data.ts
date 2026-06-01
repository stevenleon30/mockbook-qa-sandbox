export function uniqueEmail(prefix = 'qa') {
  return `${prefix}+${Date.now()}-${Math.floor(Math.random() * 10000)}@mockbook.test`;
}

export const TEST_PASSWORD = 'TestPass123!';

export const ALLOWED_STATES = ['NJ', 'NY', 'FL'] as const;
export const BLOCKED_STATES = ['CA', 'TX'] as const;

export const PROMO_CODES = {
  WELCOME: 'WELCOME50',
  RELOAD: 'RELOAD25',
  EXPIRED: 'EXPIRED10',
  INACTIVE: 'INACTIVE99',
  INVALID: 'DOESNOTEXIST',
};
