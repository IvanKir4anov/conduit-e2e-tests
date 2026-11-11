import { buildArticle, buildUser } from '../../src/data/factories';
import { expect, signInAs, test } from '../../src/fixtures';
import { ArticlePage } from '../../src/pages/article.page';
import { EditorPage } from '../../src/pages/editor.page';
import { Header } from '../../src/pages/header';
import { HomePage } from '../../src/pages/home.page';

test.describe('Article editor', () => {
  test('author publishes an article from the editor @smoke', async ({
    authedPage,
    user,
    userApi,
    deleteAfterTest,
  }) => {
    const input = buildArticle();
    await new Header(authedPage).newArticleLink.click();
    await new EditorPage(authedPage).publish(input);

    const articlePage = new ArticlePage(authedPage);
    const slug = articlePage.slugFromUrl();
    deleteAfterTest(slug);

    await expect(articlePage.title).toHaveText(input.title);
    await expect(articlePage.authorLink(user.username)).toBeVisible();

    const saved = await userApi.getArticle(slug);
    expect(saved.body).toBe(input.body);
    expect(saved.tagList).toEqual(input.tagList);
  });

  test('author edits their article @regression', async ({
    authedPage,
    article,
    userApi,
    deleteAfterTest,
  }) => {
    const articlePage = new ArticlePage(authedPage);
    await articlePage.goto(article.slug);
    await articlePage.editLink.click();

    const editor = new EditorPage(authedPage);
    await expect(editor.titleField).toHaveValue(article.title);
    const changes = buildArticle();
    await editor.publish({
      title: changes.title,
      description: changes.description,
      body: changes.body,
    });

    // The slug is derived from the title, so the edited article may live under a new slug.
    const newSlug = articlePage.slugFromUrl();
    deleteAfterTest(newSlug);
    await expect(articlePage.title).toHaveText(changes.title);
    expect((await userApi.getArticle(newSlug)).body).toBe(changes.body);
  });

  test('author deletes their article @regression', async ({ authedPage, article, userApi }) => {
    const articlePage = new ArticlePage(authedPage);
    await articlePage.goto(article.slug);
    await articlePage.deleteButton.click();

    await expect(authedPage).toHaveURL('/');
    await expect(new HomePage(authedPage).yourFeedTab).toBeVisible();
    await expect(userApi.getArticle(article.slug)).rejects.toMatchObject({ status: 404 });
  });

  test('other users see no edit or delete controls @regression', async ({ page, api, article }) => {
    const reader = await api.register(buildUser());
    await signInAs(page, reader);
    const articlePage = new ArticlePage(page);
    await articlePage.goto(article.slug);

    await expect(articlePage.title).toHaveText(article.title);
    await expect(articlePage.favoriteButton).toBeVisible();
    await expect(articlePage.editLink).toHaveCount(0);
    await expect(articlePage.deleteButton).toHaveCount(0);
  });
});
