import { buildArticle } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';
import { EditorPage } from '../../src/pages/editor.page';

test.describe('Article editor', () => {
  test('author publishes an article from the editor @smoke', async ({
    authedPage,
    user,
    userApi,
    deleteAfterTest,
  }) => {
    const input = buildArticle();
    const editor = new EditorPage(authedPage);
    await editor.goto();
    await editor.publish(input);

    const articlePage = new ArticlePage(authedPage);
    const slug = articlePage.slugFromUrl();
    deleteAfterTest(slug);

    await expect(articlePage.title).toHaveText(input.title);
    await expect(articlePage.authorLink(user.username)).toBeVisible();

    const saved = await userApi.getArticle(slug);
    expect(saved.body).toBe(input.body);
    expect(saved.tagList).toEqual(input.tagList);
  });
});
