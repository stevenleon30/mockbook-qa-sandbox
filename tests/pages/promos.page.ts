import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PromosPage extends BasePage {
  readonly codeInput = this.page.getByTestId('promo-code-input');
  readonly claimBtn = this.page.getByTestId('promo-claim-submit');
  readonly message = this.page.getByTestId('promo-message');
  readonly list = this.page.getByTestId('promo-list');

  async open() { await this.goto('/promos'); }
  async claim(code: string) {
    await this.codeInput.fill(code);
    await this.claimBtn.click();
  }
  async expectClaimed(amount: number) {
    await expect(this.message).toContainText(`Claimed: $${amount}`);
  }
  async expectError(text: string | RegExp) {
    await expect(this.message).toContainText(text);
  }
}
