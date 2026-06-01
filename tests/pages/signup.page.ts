import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SignupPage extends BasePage {
  readonly email = this.page.getByTestId('signup-email');
  readonly password = this.page.getByTestId('signup-password');
  readonly state = this.page.getByTestId('signup-state');
  readonly submit = this.page.getByTestId('signup-submit');
  readonly message = this.page.getByTestId('signup-message');

  async open() { await this.goto('/signup'); }

  async signup(email: string, password: string, state = 'NJ') {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.state.selectOption(state);
    await this.submit.click();
  }

  async expectSuccess(email: string) {
    await expect(this.message).toContainText(`Account created for ${email}`);
  }

  async expectError(text: string | RegExp) {
    await expect(this.message).toContainText(text);
  }
}
