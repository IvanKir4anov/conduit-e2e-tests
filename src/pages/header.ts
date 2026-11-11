import type { Locator, Page } from '@playwright/test';

export class Header {
  readonly signInLink: Locator;
  readonly newArticleLink: Locator;
  private readonly nav: Locator;

  constructor(page: Page) {
    // The app renders a second, empty <nav>; the main one is the one with the brand link.
    this.nav = page
      .getByRole('navigation')
      .filter({ has: page.getByRole('link', { name: 'Conduit' }) });
    this.signInLink = this.nav.getByRole('link', { name: 'Sign in' });
    this.newArticleLink = this.nav.getByRole('link', { name: /new article/i });
  }

  userLink(username: string): Locator {
    return this.nav.getByRole('link', { name: username, exact: true });
  }
}
