import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(300000);
  await page.goto('https://test.getprudens.ai/login');
  await page.getByRole('button', { name: '+ New' }).click();
  await page.getByRole('textbox', { name: 'e.g., Renewal comparison,' }).click();
  await page.getByRole('textbox', { name: 'e.g., Renewal comparison,' }).fill('Automation test');
  await page.getByRole('button', { name: '+ New', description: 'Add new resource', exact: true }).click();
  await page.getByText('Document', { exact: true }).click();
  await page.getByRole('button', { name: 'Browse Files' }).click();
  await page.locator('input[type="file"]').setInputFiles(['tests/documents/KB_01_Expat_FAQ_Mexico_Home.pdf', 'tests/documents/KB_02_Company_Profile_Donner_Associates.pdf']);
  await page.getByRole('button', { name: 'Upload 2 Documents' }).click();
  await expect(page.getByText('Completed').first()).toBeVisible({ timeout: 60000 });
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText('document').nth(1)).toBeVisible();
  await expect(page.getByText('document').nth(2)).toBeVisible();
  await page.getByRole('button', { name: ' Save' }).click();
  await page.getByRole('tablist').getByRole('button', { name: ' Generate' }).click();
  await expect(page.locator('.ai-chat-bubble').first()).toBeVisible();
  await expect(page.getByText('Edit Policy Comparison')).toBeVisible();
  await expect(page.getByRole('heading', { name: ' Policy Comparison Results' })).toBeVisible({ timeout: 300000 });
  await expect(page.getByRole('button', { name: ' Generate Comparison' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' CSV' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' PDF' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' Word' })).toBeVisible();
  await expect(page.getByText('E&O Risks High Show')).toBeVisible();
  await expect(page.getByText('Diff Only Show')).toBeVisible();
  await expect(page.getByText('Executive Summary').first()).toBeVisible();
  await expect(page.getByText('Bottom Line:')).toBeVisible();
  await expect(page.getByText('Top Differences').first()).toBeVisible();
  await expect(page.getByText('E&O Concerns:')).toBeVisible();
  await expect(page.getByText('Risk Level:')).toBeVisible();
  await expect(page.getByText('High', { exact: true })).toBeVisible();
  await expect(page.getByText('Key Concerns').first()).toBeVisible();
  await expect(page.getByText('Recommendations')).toBeVisible();

});
