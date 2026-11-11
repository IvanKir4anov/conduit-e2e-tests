import type { Locator, Page } from '@playwright/test';
import type { NewArticle } from '../api/types';

export class EditorPage {
  readonly titleField: Locator;
  private readonly description: Locator;
  private readonly body: Locator;
  private readonly tags: Locator;
  private readonly publishButton: Locator;

  constructor(private readonly page: Page) {
    this.titleField = page.getByRole('textbox', { name: 'Article Title' });
    this.description = page.getByRole('textbox', { name: "What's this article about?" });
    this.body = page.getByRole('textbox', { name: 'Write your article (in markdown)' });
    this.tags = page.getByRole('textbox', { name: 'Enter tags' });
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/editor');
  }

  async publish(article: NewArticle): Promise<void> {
    await this.titleField.fill(article.title);
    await this.description.fill(article.description);
    await this.body.fill(article.body);
    for (const tag of article.tagList ?? []) {
      await this.tags.fill(tag);
      await this.tags.press('Enter');
    }
    await this.publishButton.click();
    await this.page.waitForURL(/\/article\/[^/]+$/);
  }
}
