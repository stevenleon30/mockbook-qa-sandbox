import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly email = this.page.getByTestId('login-email');
  readonly password = this.page.getByTestId('login-password');
  readonly submit = this.page.getByTestId('login-submit');
  readonly message = this.page.getByTestId('login-message');

  async open() { await this.goto('/login'); }
  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
  async expectLoggedIn(email: string) {
    await expect(this.message).toContainText(`Logged in as ${email}`);
  }
}
