import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { getTestCredentials } from '../helpers/test-credentials';

test.describe('Auth smoke @smoke', () => {

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/aegis/policy-comparison');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /Enter Dashboard/i })).toBeVisible();
  });

  test('virtual assistant handles unauthenticated access', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/virtual-assistant');

    if (page.url().includes('/login')) {
      await expect(page.getByRole('button', { name: /Enter Dashboard/i })).toBeVisible();
      return;
    }

    await expect(page).toHaveURL(/\/virtual-assistant/);
    await expect(page.getByText('Virtual Assistants').first()).toBeVisible();
  });

  test('invalid credentials stay on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.getByRole('textbox', { name: 'Email address' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrong-password');
    await page.getByRole('button', { name: /Enter Dashboard/i }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
  });

  test('valid login reaches authenticated app shell', async ({ page }) => {
    const { email, password } = getTestCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/aegis\//);
    await expect(page.getByRole('link', { name: /Policy Comparison/i }).first()).toBeVisible();
  });
});
