import { test } from '@playwright/test';
import {
  VirtualAssistantLivePage,
  VirtualAssistantRealtimePage,
  VirtualAssistantSettingsPage
} from '../page-objects/virtual-assistant-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Virtual Assistant Settings smoke @smoke', () => {
  test('navigates all settings sidebar sections', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectPageShell();
    await settingsPage.navigateAllSettingsSections();
  });

  test('settings saves a draft form', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const formName = smokeLabel('form');

    try {
      await settingsPage.goto('forms');
      await settingsPage.openNewFormEditor();
      await settingsPage.createForm({
        name: formName,
        description: 'Smoke test form created by Playwright.'
      });
    } finally {
      await settingsPage.deleteForm(formName);
    }
  });

  test('settings escalation groups section loads and opens add group editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Escalation Groups');
    await settingsPage.expectEscalationGroupsSection();
    await settingsPage.openAddEscalationGroupEditor();
  });

  test('settings transfers section loads and opens add transfer editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Transfers');
    await settingsPage.expectTransfersSection();
    await settingsPage.openAddTransferEditor();
  });

  test('settings simulate situations tab shows agents table', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('simulate');
    await settingsPage.goToSimulateSubSection('Situations');
    await settingsPage.expectSimulateSituationsTab();
  });

  test('settings simulate opens agent test chat from situations', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('simulate');
    await settingsPage.openFirstAgentTestFromSituations();
  });

  test('live data page loads from virtual assistance menu', async ({ page }) => {
    const livePage = new VirtualAssistantLivePage(page);
    await livePage.goto();
    await livePage.expectLiveDataPage();
  });

  test('realtime page loads with call monitors', async ({ page }) => {
    const realtimePage = new VirtualAssistantRealtimePage(page);
    await realtimePage.goto();
    await realtimePage.expectRealtimePage();
  });
});
