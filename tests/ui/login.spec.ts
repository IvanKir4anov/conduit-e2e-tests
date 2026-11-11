import { expect, test } from '../../src/fixtures';
import { Header } from '../../src/pages/header';
import { LoginPage } from '../../src/pages/login.page';

test.describe('Sign in', () => {
  test('user signs in with valid credentials @smoke', async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(user.email, user.password);

    await expect(new Header(page).userLink(user.username)).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('shows an error for a wrong password @smoke', async ({ page, user }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.signIn(user.email, 'wrong-password');

    await expect(loginPage.errorMessages).toContainText(/invalid|wrong|credentials/i);
    await expect(new Header(page).userLink(user.username)).toBeHidden();
  });
});
