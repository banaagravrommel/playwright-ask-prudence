import { test } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';

test.use({ storageState: undefined });

test('save auth state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('rav@hubstart.io', 'password');
  await page.context().storageState({ path: 'storageState.json' });
});
