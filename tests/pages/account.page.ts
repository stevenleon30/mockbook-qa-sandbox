import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  readonly email = this.page.getByTestId('account-email');
  readonly state = this.page.getByTestId('account-state');
  readonly limit = this.page.getByTestId('account-limit');
  readonly excluded = this.page.getByTestId('account-excluded');
  readonly limitInput = this.page.getByTestId('limit-input');
  readonly limitSubmit = this.page.getByTestId('limit-submit');
  readonly selfExclude = this.page.getByTestId('self-exclude-submit');

  async open() { await this.goto('/account'); }
  async setLimit(amount: number) {
    await this.limitInput.fill(amount.toString());
    await this.limitSubmit.click();
  }
  async confirmSelfExclude() { await this.selfExclude.click(); }
  async expectExcluded() { await expect(this.excluded).toContainText('Yes'); }
}
