import { expect, test } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { getTestCredentials } from './helpers/test-credentials';

test.use({ storageState: undefined });

test('save auth state', async ({ page }) => {
  test.setTimeout(180000);
  const { email, password } = getTestCredentials();
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  // Prefer sidebar navigation when available; otherwise direct goto.
  const askPrudensLink = page.getByRole('link', { name: /Ask Prudens/i }).first();
  if (await askPrudensLink.isVisible({ timeout: 15000 }).catch(() => false)) {
    await askPrudensLink.click();
  } else {
    await page.goto('/virtual-assistant/ask-prudens', { waitUntil: 'commit' });
  }

  await page.waitForURL(/\/virtual-assistant\/ask-prudens/, { timeout: 60000, waitUntil: 'commit' });
  await expect(page.locator('#ai-workbench-app')).toBeAttached({ timeout: 120000 });

  await page.context().storageState({ path: 'storageState.json' });
});
