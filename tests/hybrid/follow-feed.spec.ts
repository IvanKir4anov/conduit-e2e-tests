import { buildUser } from '../../src/data/factories';
import { expect, signInAs, test } from '../../src/fixtures';
import { HomePage } from '../../src/pages/home.page';
import { ProfilePage } from '../../src/pages/profile.page';

test('following an author shows their article in Your Feed @regression', async ({
  page,
  api,
  user,
  article,
}) => {
  const reader = await api.register(buildUser());
  await signInAs(page, reader);

  const profile = new ProfilePage(page);
  await profile.goto(user.username);
  await profile.followButton(user.username).click();
  await expect(profile.unfollowButton(user.username)).toBeVisible();

  const home = new HomePage(page);
  await home.goto();
  await home.yourFeedTab.click();
  // The reader follows only this author, so the feed contains exactly this article. One
  // assertion on the whole list: checking "title visible" separately could match the Global
  // Feed that is still on screen while Your Feed loads.
  await expect(home.articlePreviews.getByRole('heading')).toHaveText([article.title]);
});
