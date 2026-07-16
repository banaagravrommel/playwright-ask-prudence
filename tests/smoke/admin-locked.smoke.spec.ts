import { test } from '@playwright/test';
import {
  AppSettingsPage,
  BindingBillingPage,
  CoiEoiEndorsementsPage,
  CrmAmsIntegrationPage,
  FnolSubmissionsPage,
  InvoiceCreatorPage
} from '../page-objects/service-modules-page';

test.describe('Admin and service modules smoke @smoke', () => {
  test('binding and billing shows feature locked state', async ({ page }) => {
    const bindingPage = new BindingBillingPage(page);
    await bindingPage.goto();
    await bindingPage.expectLockedPage();
  });

  test('coi eoi endorsements list page loads', async ({ page }) => {
    const coiPage = new CoiEoiEndorsementsPage(page);
    await coiPage.goto();
    await coiPage.expectListPage();
  });

  test('fnol submissions shows admin access only state', async ({ page }) => {
    const fnolPage = new FnolSubmissionsPage(page);
    await fnolPage.goto();
    await fnolPage.expectAdminOnlyPage();
  });

  test('crm ams integration list page loads', async ({ page }) => {
    const integrationPage = new CrmAmsIntegrationPage(page);
    await integrationPage.goto();
    await integrationPage.expectListPage();
  });

  test('invoice creator list page loads', async ({ page }) => {
    const invoicePage = new InvoiceCreatorPage(page);
    await invoicePage.goto();
    await invoicePage.expectListPage();
  });

  test('settings redirects to user management', async ({ page }) => {
    const settingsPage = new AppSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectUserManagementPage();
  });
});
