import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
  private readonly bio: Locator;
  private readonly updateButton: Locator;
  private readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.bio = page.getByRole('textbox', { name: 'Short bio about you' });
    this.updateButton = page.getByRole('button', { name: 'Update Settings' });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }

  /** Saves the bio; the app then navigates to the user's profile. */
  async updateBio(bio: string): Promise<void> {
    await this.bio.fill(bio);
    await this.updateButton.click();
    await this.page.waitForURL(/\/profile\//);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
