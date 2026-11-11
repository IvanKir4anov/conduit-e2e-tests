import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly yourFeedTab: Locator;
  readonly globalFeedTab: Locator;
  /** Article previews in the current feed: each is a link wrapping the article's heading. */
  readonly articlePreviews: Locator;

  constructor(private readonly page: Page) {
    this.yourFeedTab = page.getByRole('link', { name: 'Your Feed' });
    this.globalFeedTab = page.getByRole('link', { name: 'Global Feed' });
    this.articlePreviews = page
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { level: 1 }) });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  articlePreview(title: string): Locator {
    return this.articlePreviews.filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    });
  }
}
