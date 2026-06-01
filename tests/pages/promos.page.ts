import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PromosPage extends BasePage {
  readonly codeInput = this.page.locator('[data-testid="promo-code-input"]:visible').first();
  readonly claimBtn = this.page.locator('[data-testid="promo-claim-submit"]:visible').first();
  readonly message = this.page.getByTestId('promo-message').first();

  async open() {
    await this.goto('/promos');
    await this.codeInput.waitFor({ state: 'visible' });
    await expect(this.claimBtn).toBeEnabled();
  }

  async claim(code: string) {
    await this.codeInput.waitFor({ state: 'visible' });
    await this.codeInput.click();
    await this.codeInput.press('ControlOrMeta+a');
    await this.codeInput.press('Backspace');
    await this.codeInput.type(code);
    await expect(this.codeInput).toHaveValue(code);
    await this.codeInput.press('Tab');
    await expect(this.codeInput).toHaveValue(code);
    await expect(this.claimBtn).toBeEnabled();
    await this.claimBtn.click();
  }
  async expectClaimed(amount: number) {
    await expect(this.message).toContainText(`Claimed: $${amount}`);
  }
  async expectError(text: string | RegExp) {
    await expect(this.message).toContainText(text);
  }
}
