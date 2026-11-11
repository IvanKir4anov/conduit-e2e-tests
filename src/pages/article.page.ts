import type { Locator, Page } from '@playwright/test';

export class ArticlePage {
  readonly title: Locator;
  readonly favoriteButton: Locator;
  readonly unfavoriteButton: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly commentInput: Locator;
  readonly signInToCommentLink: Locator;
  private readonly banner: Locator;
  private readonly postCommentButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('heading', { level: 1 });
    // Author info is rendered twice (banner and below the body); the banner has no landmark
    // role, so its class scopes the lookup.
    this.banner = page.locator('.banner');
    // Article actions are rendered twice (banner and below the body); the banner copy is used.
    // Accessible names start with an icon glyph, hence the leading \W*.
    this.favoriteButton = this.banner.getByRole('button', { name: /^\W*Favorite Article/ });
    this.unfavoriteButton = this.banner.getByRole('button', { name: /^\W*Unfavorite Article/ });
    this.editLink = this.banner.getByRole('link', { name: /Edit Article/ });
    this.deleteButton = this.banner.getByRole('button', { name: /Delete Article/ });
    this.signInToCommentLink = page
      .getByText(/to add comments on this article/)
      .getByRole('link', { name: 'Sign in' });
    this.commentInput = page.getByRole('textbox', { name: 'Write a comment...' });
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
  }

  async goto(slug: string): Promise<void> {
    await this.page.goto(`/article/${slug}`);
  }

  authorLink(username: string): Locator {
    return this.banner.getByRole('link', { name: username, exact: true });
  }

  slugFromUrl(): string {
    const slug = new URL(this.page.url()).pathname.match(/^\/article\/([^/]+)$/)?.[1];
    if (!slug) throw new Error(`Not on an article page: ${this.page.url()}`);
    return slug;
  }

  async addComment(text: string): Promise<void> {
    await this.commentInput.fill(text);
    await this.postCommentButton.click();
  }

  comment(text: string): Locator {
    return this.page.getByRole('paragraph').filter({ hasText: text });
  }

  commentAuthor(text: string): Locator {
    // Each comment is a card; there is no accessible grouping, so the card class is used.
    // The card has two author links (avatar and name); the name link is the one with text.
    return this.page
      .locator('.card')
      .filter({ has: this.comment(text) })
      .getByRole('link')
      .filter({ hasText: /\S/ });
  }
}
