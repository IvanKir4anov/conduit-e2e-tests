import type { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly bio: Locator;

  constructor(private readonly page: Page) {
    // The bio paragraph has no label; the profile header class scopes it.
    this.bio = page.locator('.user-info').getByRole('paragraph');
  }

  async goto(username: string): Promise<void> {
    await this.page.goto(`/profile/${username}`);
  }

  followButton(username: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^\\W*Follow ${username}$`) });
  }

  unfollowButton(username: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^\\W*Unfollow ${username}$`) });
  }
}
