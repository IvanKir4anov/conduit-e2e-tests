import type { Locator, Page } from '@playwright/test';
import type { NewUser } from '../api/types';

export class RegisterPage {
  readonly errorMessages: Locator;
  private readonly username: Locator;
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.submit = page.getByRole('button', { name: 'Sign up' });
    // The error list has no accessible name; the app's own class is the only stable hook.
    this.errorMessages = page.locator('.error-messages');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async signUp(user: NewUser): Promise<void> {
    await this.username.fill(user.username);
    await this.email.fill(user.email);
    await this.password.fill(user.password);
    await this.submit.click();
  }
}
