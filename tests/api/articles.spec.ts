import { ApiError } from '../../src/api/conduit-api';
import { buildArticle } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures';

test.describe('Articles API', () => {
  test('creates, reads and deletes an article @smoke', async ({ user, userApi }) => {
    const input = buildArticle();

    const created = await userApi.createArticle(input);
    expect(created.slug).toBeTruthy();
    expect(created.author.username).toBe(user.username);
    expect((await userApi.getArticle(created.slug)).title).toBe(input.title);

    await userApi.deleteArticle(created.slug);
    await expect(userApi.getArticle(created.slug)).rejects.toMatchObject({
      constructor: ApiError,
      status: 404,
    });
  });

  test('comments on an article prepared by a fixture @regression', async ({ article, userApi }) => {
    const comment = await userApi.addComment(article.slug, 'Looks good');
    expect(comment.body).toBe('Looks good');
  });
});
