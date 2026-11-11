import { expect, test } from '../../src/fixtures';
import { Header } from '../../src/pages/header';
import { ProfilePage } from '../../src/pages/profile.page';
import { SettingsPage } from '../../src/pages/settings.page';

test.describe('Settings', () => {
  test('user updates their bio and sees it on the profile @regression', async ({
    authedPage,
    user,
    userApi,
  }) => {
    const bio = `Testing since ${user.username}`;
    const settings = new SettingsPage(authedPage);
    await settings.goto();
    await settings.updateBio(bio);

    const profile = new ProfilePage(authedPage);
    await profile.goto(user.username);
    await expect(profile.bio).toHaveText(bio);
    expect((await userApi.currentUser()).bio).toBe(bio);
  });

  test('user signs out and stays signed out after reload @regression', async ({
    authedPage,
    user,
  }) => {
    const settings = new SettingsPage(authedPage);
    await settings.goto();
    await settings.logout();

    const header = new Header(authedPage);
    await expect(header.signInLink).toBeVisible();
    await authedPage.reload();
    await expect(header.signInLink).toBeVisible();
    await expect(header.userLink(user.username)).toBeHidden();
  });
});
