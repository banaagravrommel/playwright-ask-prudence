import { test } from '@playwright/test';
import { FormFillPage, FormFillTemplatesPage } from '../page-objects/form-automation-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Form Automation smoke @smoke', () => {
  test('form fill templates list page loads', async ({ page }) => {
    const templatesPage = new FormFillTemplatesPage(page);
    await templatesPage.goto();
    await templatesPage.expectListPage();
  });

  test('form fill templates opens add template editor', async ({ page }) => {
    const templatesPage = new FormFillTemplatesPage(page);
    await templatesPage.goto();
    await templatesPage.openAddTemplateEditor();
  });

  test('form fill templates creates a draft via save and edit', async ({ page }) => {
    const templatesPage = new FormFillTemplatesPage(page);
    const templateName = smokeLabel('form-fill-template');

    await templatesPage.goto();
    await templatesPage.createTemplate({ name: templateName, type: 'HTML' });
  });

  test('form fill records list page loads', async ({ page }) => {
    const formFillPage = new FormFillPage(page);
    await formFillPage.goto();
    await formFillPage.expectListPage();
  });

  test('form fill opens new record flow', async ({ page }) => {
    const formFillPage = new FormFillPage(page);
    await formFillPage.goto();
    await formFillPage.openNewFormFill();
  });
});
