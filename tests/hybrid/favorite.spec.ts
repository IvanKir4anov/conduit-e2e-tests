import { buildUser } from '../../src/data/factories';
import { expect, signInAs, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';

test('reader favorites and unfavorites an article @regression', async ({
  page,
  api,
  userApi,
  article,
}) => {
  const reader = await api.register(buildUser());
  await signInAs(page, reader);
  const articlePage = new ArticlePage(page);
  await articlePage.goto(article.slug);

  await articlePage.favoriteButton.click();
  await expect(articlePage.unfavoriteButton).toContainText('(1)');
  expect((await userApi.getArticle(article.slug)).favoritesCount).toBe(1);

  await articlePage.unfavoriteButton.click();
  await expect(articlePage.favoriteButton).toContainText('(0)');
  // The page adjusts the counter locally, so the stored value is checked through the API.
  expect((await userApi.getArticle(article.slug)).favoritesCount).toBe(0);
});
