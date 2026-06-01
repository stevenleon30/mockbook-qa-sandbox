import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SignupPage extends BasePage {
  readonly email = this.page.locator('[data-testid="signup-email"]:visible').first();
  readonly password = this.page.locator('[data-testid="signup-password"]:visible').first();
  readonly state = this.page.locator('[data-testid="signup-state"]:visible').first();
  readonly submit = this.page.locator('[data-testid="signup-submit"]:visible').first();
  readonly message = this.page.getByTestId('signup-message').first();

  async open() { await this.goto('/signup'); }

  async signup(email: string, password: string, state = 'NJ') {
    await this.email.waitFor({ state: 'visible' });
    await this.email.click();
    await this.email.press('ControlOrMeta+a');
    await this.email.press('Backspace');
    await this.email.type(email);
    await expect(this.email).toHaveValue(email);

    await this.password.click();
    await this.password.press('ControlOrMeta+a');
    await this.password.press('Backspace');
    await this.password.type(password);
    await expect(this.password).toHaveValue(password);

    await this.state.selectOption(state);
    await expect(this.state).toHaveValue(state);
    await this.submit.click();
  }

  async expectSuccess(email: string) {
    await expect(this.message).toContainText(`Account created for ${email}`);
  }

  async expectError(text: string | RegExp) {
    await expect(this.message).toContainText(text);
  }
}
