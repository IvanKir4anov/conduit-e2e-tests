import { expect, test } from '@playwright/test';
import { ConduitApi } from '../../src/api/conduit-api';

const unique = () => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

test.describe('Users API', () => {
  test('registers a user and logs in with the same credentials @smoke', async ({ request }) => {
    const api = new ConduitApi(request);
    const username = unique();
    const input = { username, email: `${username}@example.test`, password: `P-${unique()}` };

    const registered = await api.register(input);
    expect(registered.username).toBe(input.username);
    expect(registered.token).toBeTruthy();

    const loggedIn = await api.login(input.email, input.password);
    expect(loggedIn.username).toBe(input.username);

    const current = await api.withToken(loggedIn.token).currentUser();
    expect(current.email).toBe(input.email);
  });

  test('rejects login with a wrong password @smoke', async ({ request }) => {
    const api = new ConduitApi(request);
    const username = unique();
    await api.register({ username, email: `${username}@example.test`, password: `P-${unique()}` });

    await expect(api.login(`${username}@example.test`, 'wrong-password')).rejects.toThrow(
      /401|403|422/,
    );
  });
});
