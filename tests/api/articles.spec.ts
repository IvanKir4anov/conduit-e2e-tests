import { expect, test } from '@playwright/test';
import { ConduitApi } from '../../src/api/conduit-api';

const unique = () => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

test.describe('Articles API', () => {
  test('creates, reads and deletes an article @smoke', async ({ request }) => {
    const username = unique();
    const author = await new ConduitApi(request).register({
      username,
      email: `${username}@example.test`,
      password: `P-${unique()}`,
    });
    const api = new ConduitApi(request, author.token);
    const input = { title: `Article ${unique()}`, description: 'About testing', body: 'Body text' };

    const created = await api.createArticle(input);
    expect(created.slug).toBeTruthy();
    expect(created.author.username).toBe(author.username);
    expect((await api.getArticle(created.slug)).title).toBe(input.title);

    await api.deleteArticle(created.slug);
    await expect(api.getArticle(created.slug)).rejects.toThrow(/404/);
  });
});
