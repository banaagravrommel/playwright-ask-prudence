import { test, expect } from '@playwright/test';
import {
  AskPrudensPage,
  VirtualAssistantObserversPage,
  VirtualAssistantPage,
  VirtualAssistantSettingsPage
} from '../page-objects/virtual-assistant-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Virtual Assistant smoke @smoke', () => {
  test('assistants list page loads with table and actions', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.expectListPage();

    await expect(page.getByRole('row').filter({ hasText: /active/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /SOPs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Observers/i })).toBeVisible();
  });

  test('new assistant opens the editor with configuration tabs', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.openNewAssistantEditor();

    await expect(page.getByRole('tab', { name: 'Personality' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Greetings' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Phone Numbers' })).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Preview Voice/i })).toBeVisible();
  });

  test('observers page loads from module sub-navigation', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.goToObservers();

    const observersPage = new VirtualAssistantObserversPage(page);
    await observersPage.expectObserversPage();
  });

  test('sops tab shows company sops management', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.goToSops();
    await vaPage.expectSopsPage();

    await page.getByRole('link', { name: /Assistants/i }).first().click();
    await vaPage.expectListPage();
  });

  test('add sop opens editor and saves a draft sop', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    const sopTitle = smokeLabel('sop');

    await vaPage.goto();
    await vaPage.goToSops();
    await vaPage.openAddSopEditor();
    await vaPage.createSop({
      title: sopTitle,
      description: 'Smoke test SOP created by Playwright',
      steps: 'Step 1: Verify the SOP editor saves successfully.'
    });
  });

  test('new observer form creates an observer', async ({ page }) => {
    const observersPage = new VirtualAssistantObserversPage(page);
    const observerName = smokeLabel('observer');

    await observersPage.goto();
    await observersPage.openNewObserverForm();
    await observersPage.createObserver({
      name: observerName,
      description: 'Smoke test observer created by Playwright.'
    });
  });

  test('existing assistant opens in the editor from the list', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.openFirstActiveAssistant();

    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Personality' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Activities' })).toBeVisible();
  });

  test('ask prudens workbench loads', async ({ page }) => {
    const askPage = new AskPrudensPage(page);
    await askPage.goto();
    await askPage.expectPageShell();
    await askPage.expectSessionSidebarControls();
    await askPage.expectWorkbench();
  });

  test('ask prudens creates a demo chat session', async ({ page }) => {
    const askPage = new AskPrudensPage(page);
    const sessionTitle = smokeLabel('ask-prudens-flow');

    await askPage.goto();
    const resourceName = await askPage.startAskPrudensChatSession('Demo', sessionTitle, 'Demo', 'smoke');
    await askPage.expectAskPrudensChatReady(sessionTitle, { accountName: 'Demo', agent: 'Demo' });
    await askPage.expectAskPrudensSessionTabs(resourceName);
    await askPage.expectAskPrudensAgentDialog('Demo');
    await askPage.expectAskPrudensSopDialog();
  });

  test('navigate from assistants list to ask prudens via sidebar', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();
    await vaPage.goToAskPrudens();

    const askPage = new AskPrudensPage(page);
    await askPage.expectWorkbench();
  });

  test('settings page loads knowledge bases section', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectPageShell();
    await settingsPage.expectKnowledgeBasesSection();
  });

  test('settings navigates between forms and tools sections', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto();

    await settingsPage.goToSection('Forms');
    await settingsPage.expectFormsSection();

    await settingsPage.goToSection('Tools');
    await settingsPage.expectToolsSection();

    await settingsPage.goToSection('Knowledge Base');
    await settingsPage.expectKnowledgeBasesSection();
  });

  test('settings new form opens the form editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('forms');
    await settingsPage.openNewFormEditor();
  });

  test('navigate to settings from virtual assistance app menu', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);
    await vaPage.goto();

    await page.getByRole('link', { name: /Virtual Assistance/i }).click();
    await page.locator('a[href*="virtual-assistant-settings"]').filter({ hasText: 'Settings' }).click();
    await expect(page).toHaveURL(/\/virtual-assistant-settings/);

    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.expectPageShell();
    await settingsPage.expectKnowledgeBasesSection();
  });

  test('settings add knowledge base saves a draft', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const kbName = smokeLabel('kb');

    await settingsPage.goto();
    await settingsPage.openAddKnowledgeBaseEditor();
    await settingsPage.createKnowledgeBase({
      name: kbName,
      purpose: 'Smoke test knowledge base created by Playwright.'
    });
  });

  test('settings add tool saves an internal function tool', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const toolName = smokeLabel('tool');

    await settingsPage.goto('tools');
    await settingsPage.openAddToolEditor();
    await settingsPage.createTool({
      name: toolName,
      description: 'Smoke test tool created by Playwright.'
    });
  });

  test('settings trigger admin section loads and opens new trigger editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.goToSection('Trigger Admin');
    await settingsPage.expectTriggerAdminSection();
    await settingsPage.openNewTriggerEditor();
  });

  test('settings verifications section loads and opens add verification editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('verifications');
    await settingsPage.expectVerificationsSection();
    await settingsPage.openAddVerificationEditor();
  });

  test('settings escalations section loads', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.expectEscalationsSection();
  });

  test('settings simulate section loads', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('simulate');
    await settingsPage.expectSimulateSection();
  });
});
