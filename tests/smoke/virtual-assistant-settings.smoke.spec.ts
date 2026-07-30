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

  test('settings creates an escalation group and cleans up', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const groupName = smokeLabel('escalation-group');

    try {
      await settingsPage.goto('escalations');
      await settingsPage.goToEscalationsSubSection('Escalation Groups');
      await settingsPage.createEscalationGroup({
        name: groupName,
        emails: 'smoke-escalation@example.com',
        when: 'Smoke test: escalate when Playwright creates a draft escalation group.'
      });
      await settingsPage.expectEscalationGroupInList(groupName);
    } finally {
      await settingsPage.deleteEscalationGroup(groupName);
    }
  });

  test('settings transfers section loads and opens add transfer editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Transfers');
    await settingsPage.expectTransfersSection();
    await settingsPage.openAddTransferEditor();
  });

  test('settings creates a transfer and cleans up', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const transferName = smokeLabel('transfer');

    try {
      await settingsPage.goto('escalations');
      await settingsPage.goToEscalationsSubSection('Transfers');
      await settingsPage.createTransfer({
        name: transferName,
        when: 'Smoke test: transfer created by Playwright.'
      });
      await settingsPage.expectTransferInList(transferName);
    } finally {
      await settingsPage.deleteTransfer(transferName);
    }
  });

  test('settings creates a trigger and cleans up', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const triggerName = smokeLabel('trigger');

    try {
      await settingsPage.gotoTriggerAdmin();
      await settingsPage.createTrigger({ name: triggerName });
      await settingsPage.expectTriggerInList(triggerName);
    } finally {
      await settingsPage.deleteTrigger(triggerName);
    }
  });

  test('settings creates a verification and cleans up', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const verificationName = smokeLabel('verification');

    try {
      await settingsPage.goto('verifications');
      await settingsPage.createVerification({ name: verificationName });
      await settingsPage.expectVerificationInList(verificationName);
    } finally {
      await settingsPage.deleteVerification(verificationName);
    }
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
