import { buildArticle } from '../../src/data/factories';
import { deleteIgnoringMissing, expect, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';
import { EditorPage } from '../../src/pages/editor.page';

test.describe('Article editor', () => {
  let createdSlug: string | undefined;

  test.afterEach(async ({ userApi }) => {
    if (createdSlug) await deleteIgnoringMissing(userApi, createdSlug);
    createdSlug = undefined;
  });

  test('author publishes an article from the editor @smoke', async ({
    authedPage,
    user,
    userApi,
  }) => {
    const input = buildArticle();
    const editor = new EditorPage(authedPage);
    await editor.goto();
    await editor.publish(input);

    const articlePage = new ArticlePage(authedPage);
    await expect(articlePage.title).toHaveText(input.title);
    await expect(articlePage.authorLink(user.username)).toBeVisible();

    createdSlug = articlePage.slugFromUrl();
    const saved = await userApi.getArticle(createdSlug);
    expect(saved.body).toBe(input.body);
    expect(saved.tagList).toEqual(input.tagList);
  });
});
