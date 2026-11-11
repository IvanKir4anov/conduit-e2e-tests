import { expect, test } from '@playwright/test';
import { buildArticle, buildUser } from '../../src/data/factories';

test('generates unique users and articles', () => {
  const users = Array.from({ length: 1000 }, () => buildUser());
  expect(new Set(users.map((u) => u.username)).size).toBe(1000);
  expect(new Set(users.map((u) => u.email)).size).toBe(1000);
  for (const user of users) {
    expect(user.username).toMatch(/^[a-z0-9-]{1,40}$/);
    expect(user.email).toMatch(/@example\.test$/);
    expect(user.password.length).toBeGreaterThanOrEqual(16);
  }

  const titles = Array.from({ length: 100 }, () => buildArticle().title);
  expect(new Set(titles).size).toBe(100);
});
