import { buildUser, uniqueId } from '../../src/data/factories';
import { expect, signInAs, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';

// Data is prepared through the API (fast, reliable); only the behaviour under test goes
// through the UI.
test('reader comments on an article created via API @smoke', async ({ api, article, page }) => {
  const reader = await api.register(buildUser());
  await signInAs(page, reader);

  const articlePage = new ArticlePage(page);
  await articlePage.goto(article.slug);
  const text = `Comment ${uniqueId('c')}`;
  await articlePage.addComment(text);

  await expect(articlePage.comment(text)).toBeVisible();
  await expect(articlePage.commentAuthor(text)).toHaveText(reader.username);

  // The page renders the comment from the POST response; a reload proves it was stored.
  await page.reload();
  await expect(articlePage.comment(text)).toBeVisible();
  await expect(articlePage.commentAuthor(text)).toHaveText(reader.username);
});
