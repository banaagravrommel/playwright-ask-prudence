import { test } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { getTestCredentials } from './helpers/test-credentials';

test.use({ storageState: undefined });

test('save auth state', async ({ page }) => {
  const { email, password } = getTestCredentials();
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.context().storageState({ path: 'storageState.json' });
});
