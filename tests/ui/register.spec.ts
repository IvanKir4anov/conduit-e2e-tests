import { buildUser } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures';
import { Header } from '../../src/pages/header';
import { RegisterPage } from '../../src/pages/register.page';

test.describe('Sign up', () => {
  test('new user signs up through the form @regression', async ({ page, api }) => {
    const input = buildUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.signUp(input);

    await expect(new Header(page).userLink(input.username)).toBeVisible();
    // The account really exists: the same credentials work against the API.
    expect((await api.login(input.email, input.password)).username).toBe(input.username);
  });

  test('rejects a username that is already taken @regression', async ({ page, user }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.signUp(buildUser({ username: user.username }));

    await expect(registerPage.errorMessages).toContainText(/username has already been taken/i);
    await expect(page).toHaveURL(/\/register$/);
  });

  test('rejects an email that is already taken @regression', async ({ page, user }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.signUp(buildUser({ email: user.email }));

    await expect(registerPage.errorMessages).toContainText(/email has already been taken/i);
    await expect(page).toHaveURL(/\/register$/);
  });
});
