import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly email = this.page.locator('[data-testid="login-email"]:visible').first();
  readonly password = this.page.locator('[data-testid="login-password"]:visible').first();
  readonly submit = this.page.locator('[data-testid="login-submit"]:visible').first();
  readonly message = this.page.getByTestId('login-message').first();

  async open() { await this.goto('/login'); }

  private async fillAndAssertValue(field: typeof this.email, value: string) {
    await field.waitFor({ state: 'visible' });
    await field.click();
    await field.press('ControlOrMeta+a');
    await field.press('Backspace');
    await field.type(value);
    await expect(field).toHaveValue(value);
    await this.page.waitForTimeout(100);
    await expect(field).toHaveValue(value);
  }

  async login(email: string, password: string) {
    await this.fillAndAssertValue(this.email, email);
    await this.fillAndAssertValue(this.password, password);
    await this.password.press('Tab');
    await expect(this.email).toHaveValue(email);
    await expect(this.password).toHaveValue(password);
    await expect(this.submit).toBeEnabled();
    await this.submit.click();
  }

  async expectLoggedIn(email: string) {
    await expect
      .poll(
        async () => {
          const loginMessage = (await this.message.textContent()) ?? '';
          if (loginMessage.includes(`Logged in as ${email}`)) return 'ok';

          if (!this.page.url().includes('/login')) {
            const accountEmail = this.page.getByTestId('account-email').first();
            const accountText = (await accountEmail.textContent()) ?? '';
            if (accountText.includes(email)) return 'ok';
          }

          return '';
        },
        { timeout: 10000 }
      )
      .toBe('ok');
  }
}
