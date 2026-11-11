import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import type {
  Article,
  ArticleQuery,
  Comment,
  NewArticle,
  NewUser,
  Profile,
  User,
  UserUpdate,
} from './types';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** A non-2xx API response. Assert on `status`, not on the message text. */
export class ApiError extends Error {
  constructor(
    readonly method: Method,
    readonly url: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(`${method} ${url} failed: ${status} ${responseBody}`);
    this.name = 'ApiError';
  }
}

/**
 * Typed client for the RealWorld API. Used to prepare test data and in API tests.
 * Every call fails fast with method, URL, status and response body. The request body is
 * never included in errors because it may contain passwords.
 */
export class ConduitApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  withToken(token: string): ConduitApi {
    return new ConduitApi(this.request, token);
  }

  async register(user: NewUser): Promise<User> {
    return (await this.send<{ user: User }>('POST', '/users', { user })).user;
  }

  async login(email: string, password: string): Promise<User> {
    return (await this.send<{ user: User }>('POST', '/users/login', { user: { email, password } }))
      .user;
  }

  async currentUser(): Promise<User> {
    return (await this.send<{ user: User }>('GET', '/user')).user;
  }

  async updateUser(changes: UserUpdate): Promise<User> {
    return (await this.send<{ user: User }>('PUT', '/user', { user: changes })).user;
  }

  async getProfile(username: string): Promise<Profile> {
    return (await this.send<{ profile: Profile }>('GET', `/profiles/${username}`)).profile;
  }

  // The backend rejects these POSTs without a body (400), so an empty JSON object is sent.
  async follow(username: string): Promise<Profile> {
    return (await this.send<{ profile: Profile }>('POST', `/profiles/${username}/follow`, {}))
      .profile;
  }

  async unfollow(username: string): Promise<Profile> {
    return (await this.send<{ profile: Profile }>('DELETE', `/profiles/${username}/follow`))
      .profile;
  }

  async listArticles(query: ArticleQuery = {}): Promise<Article[]> {
    const params = new URLSearchParams(
      Object.entries(query).map(([key, value]) => [key, String(value)]),
    );
    return (await this.send<{ articles: Article[] }>('GET', `/articles?${params}`)).articles;
  }

  async feed(): Promise<Article[]> {
    return (await this.send<{ articles: Article[] }>('GET', '/articles/feed')).articles;
  }

  async createArticle(article: NewArticle): Promise<Article> {
    return (await this.send<{ article: Article }>('POST', '/articles', { article })).article;
  }

  async getArticle(slug: string): Promise<Article> {
    return (await this.send<{ article: Article }>('GET', `/articles/${slug}`)).article;
  }

  async deleteArticle(slug: string): Promise<void> {
    await this.send('DELETE', `/articles/${slug}`);
  }

  async favorite(slug: string): Promise<Article> {
    return (await this.send<{ article: Article }>('POST', `/articles/${slug}/favorite`, {}))
      .article;
  }

  async unfavorite(slug: string): Promise<Article> {
    return (await this.send<{ article: Article }>('DELETE', `/articles/${slug}/favorite`)).article;
  }

  /** Cleanup helper: deletes the article, treating "already gone" (404) as success. */
  async deleteArticleIfExists(slug: string): Promise<void> {
    try {
      await this.deleteArticle(slug);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }

  async addComment(slug: string, body: string): Promise<Comment> {
    return (
      await this.send<{ comment: Comment }>('POST', `/articles/${slug}/comments`, {
        comment: { body },
      })
    ).comment;
  }

  private async send<T = unknown>(method: Method, path: string, data?: object): Promise<T> {
    const url = `${env.apiUrl}${path}`;
    const response = await this.request.fetch(url, {
      method,
      data,
      headers: this.token ? { Authorization: `Token ${this.token}` } : {},
    });
    if (!response.ok()) {
      throw new ApiError(method, url, response.status(), await safeText(response));
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

async function safeText(response: APIResponse): Promise<string> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return '<no body>';
  }
}
