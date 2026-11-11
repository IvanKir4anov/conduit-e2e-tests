import { test as base, expect, type Page } from '@playwright/test';
import { ConduitApi } from '../api/conduit-api';
import type { Article, User } from '../api/types';
import { buildArticle, buildUser } from '../data/factories';
import { Header } from '../pages/header';

export type TestUser = User & { password: string };

interface Fixtures {
  /** Unauthenticated API client. */
  api: ConduitApi;
  /**
   * A fresh user registered via the API for every test. RealWorld has no endpoint to delete
   * users, so isolation comes from unique data rather than cleanup.
   */
  user: TestUser;
  /** API client authenticated as `user`. */
  userApi: ConduitApi;
  /** An article by `user`, created via the API and deleted after the test. */
  article: Article;
  /**
   * Registers an article for deletion after the test, even if the test fails. Call it as
   * soon as the slug is known, before any assertion. Already-deleted articles are ignored.
   */
  deleteAfterTest: (slug: string) => void;
  /** Browser page already signed in as `user` (session injected, no UI login). */
  authedPage: Page;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ConduitApi(request));
  },

  user: async ({ api }, use) => {
    const input = buildUser();
    const registered = await api.register(input);
    await use({ ...registered, password: input.password });
  },

  userApi: async ({ api, user }, use) => {
    await use(api.withToken(user.token));
  },

  article: async ({ userApi }, use) => {
    const article = await userApi.createArticle(buildArticle());
    await use(article);
    await userApi.deleteArticleIfExists(article.slug);
  },

  deleteAfterTest: async ({ userApi }, use) => {
    const slugs: string[] = [];
    await use((slug) => slugs.push(slug));
    for (const slug of slugs) await userApi.deleteArticleIfExists(slug);
  },

  authedPage: async ({ page, user }, use) => {
    await signInAs(page, user);
    await use(page);
  },
});

export { expect };

/**
 * Injects the session the way the app stores it (localStorage `jwtToken`) and checks the UI
 * picked it up. The token was just issued by the API, so no extra validation request is made.
 * The init script runs on every navigation, so a sessionStorage flag makes it inject only
 * once: after a logout in the test, the user stays logged out.
 * Call it at most once per page; to act as another user, use a new page or browser context.
 */
export async function signInAs(page: Page, user: User): Promise<void> {
  await page.addInitScript((token) => {
    if (window.sessionStorage.getItem('e2e-session-injected')) return;
    window.localStorage.setItem('jwtToken', token);
    window.sessionStorage.setItem('e2e-session-injected', '1');
  }, user.token);
  await page.goto('/');
  await expect(new Header(page).userLink(user.username)).toBeVisible();
}
