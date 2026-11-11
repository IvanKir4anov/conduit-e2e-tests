import { buildArticle, buildUser } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures';

test.describe('Social API', () => {
  test('following an author puts their articles into the feed @regression', async ({
    api,
    userApi,
    article,
    user,
  }) => {
    const reader = await api.register(buildUser());
    const readerApi = api.withToken(reader.token);
    expect((await readerApi.feed()).map((a) => a.slug)).not.toContain(article.slug);

    const profile = await readerApi.follow(user.username);
    expect(profile.following).toBe(true);
    expect((await readerApi.feed()).map((a) => a.slug)).toContain(article.slug);

    await readerApi.unfollow(user.username);
    expect((await readerApi.feed()).map((a) => a.slug)).not.toContain(article.slug);
    expect((await userApi.getProfile(reader.username)).following).toBe(false);
  });

  test('favoriting updates the flag and the counter @regression', async ({ api, article }) => {
    const reader = api.withToken((await api.register(buildUser())).token);

    const favorited = await reader.favorite(article.slug);
    expect(favorited).toMatchObject({ favorited: true, favoritesCount: 1 });

    const unfavorited = await reader.unfavorite(article.slug);
    expect(unfavorited).toMatchObject({ favorited: false, favoritesCount: 0 });
  });

  test('filters articles by tag and by author @regression', async ({ userApi, user }) => {
    const tagged = await userApi.createArticle(buildArticle());
    const tag = tagged.tagList[0] ?? '';
    try {
      const byTag = await userApi.listArticles({ tag });
      expect(byTag.map((a) => a.slug)).toEqual([tagged.slug]);

      const byAuthor = await userApi.listArticles({ author: user.username });
      expect(byAuthor.map((a) => a.slug)).toEqual([tagged.slug]);
    } finally {
      await userApi.deleteArticleIfExists(tagged.slug);
    }
  });

  test('updates the profile bio @regression', async ({ userApi, user }) => {
    const bio = `Bio ${user.username}`;
    const updated = await userApi.updateUser({ bio });
    expect(updated.bio).toBe(bio);
    expect((await userApi.getProfile(user.username)).bio).toBe(bio);
  });
});
