import { expect, test } from '@playwright/test';
import { ConduitApi } from '../../src/api/conduit-api';
import { buildUser } from '../../src/data/factories';

test.describe('Users API', () => {
  test('registers a user and logs in with the same credentials @smoke', async ({ request }) => {
    const api = new ConduitApi(request);
    const input = buildUser();

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
    const input = buildUser();
    await api.register(input);

    await expect(api.login(input.email, 'wrong-password')).rejects.toThrow(/401|403|422/);
  });
});
