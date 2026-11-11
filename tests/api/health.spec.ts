import { expect, test } from '@playwright/test';

// Proves the whole stack is wired: nginx serves the frontend and proxies /api to the backend
// on the same origin. Every other test depends on this.
test('app and API are served from one origin @smoke', async ({ request }) => {
  const page = await request.get('/');
  expect(page.status()).toBe(200);
  expect(await page.text()).toMatch(/conduit/i);

  const tags = await request.get('/api/tags');
  expect(tags.status()).toBe(200);
  expect(Array.isArray((await tags.json()).tags)).toBe(true);
});
