import { expect, test } from '../../src/fixtures';
import { Header } from '../../src/pages/header';

test('injected session shows the user as signed in @smoke', async ({ authedPage, user }) => {
  const header = new Header(authedPage);
  await expect(header.userLink(user.username)).toBeVisible();
  await expect(header.signInLink).toBeHidden();
});
