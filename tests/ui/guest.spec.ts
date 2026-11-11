import { expect, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';

test.describe('Guest', () => {
  test('guest reads an article but must sign in to comment @regression', async ({
    page,
    article,
  }) => {
    const articlePage = new ArticlePage(page);
    await articlePage.goto(article.slug);

    await expect(articlePage.title).toHaveText(article.title);
    await expect(articlePage.signInToCommentLink).toBeVisible();
    await expect(articlePage.commentInput).toHaveCount(0);
  });

  test('guest opening the editor is sent to sign in @regression', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toHaveURL(/\/login$/);
  });
});
