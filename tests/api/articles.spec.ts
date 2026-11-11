import { expect, test } from '@playwright/test';
import { ConduitApi } from '../../src/api/conduit-api';
import { buildArticle, buildUser } from '../../src/data/factories';

test.describe('Articles API', () => {
  test('creates, reads and deletes an article @smoke', async ({ request }) => {
    const author = await new ConduitApi(request).register(buildUser());
    const api = new ConduitApi(request, author.token);
    const input = buildArticle();

    const created = await api.createArticle(input);
    expect(created.slug).toBeTruthy();
    expect(created.author.username).toBe(author.username);
    expect((await api.getArticle(created.slug)).title).toBe(input.title);

    await api.deleteArticle(created.slug);
    await expect(api.getArticle(created.slug)).rejects.toThrow(/404/);
  });
});
