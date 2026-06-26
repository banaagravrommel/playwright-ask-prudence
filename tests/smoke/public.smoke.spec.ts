import { test, expect } from '@playwright/test';

test.describe('Public smoke @smoke', () => {

  test('homepage loads with primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Prudens AI/i);
    await expect(page.getByRole('navigation').getByRole('link', { name: /Log In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Request a Demo|Request Your Demo/i }).first()).toBeVisible();
  });

  test('login page renders sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sign In/i);
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Enter Dashboard/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in with Passkey/i })).toBeVisible();
  });

  test('password reset page loads', async ({ page }) => {
    await page.goto('/password/reset');
    await expect(page).toHaveTitle(/Password Reset/i);
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Password Reset Link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to sign in/i })).toBeVisible();
  });

  test('policy comparison feature page loads', async ({ page }) => {
    await page.goto('/features/policy-comparison');
    await expect(page).toHaveTitle(/Policy Comparison/i);
    await expect(page.getByRole('heading', { name: /Compare Quotes/i })).toBeVisible();
  });
});
