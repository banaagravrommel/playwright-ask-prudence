import { expect, test } from '../helpers/smoke-test';
import {
  VirtualAssistantLivePage,
  VirtualAssistantRealtimePage,
  VirtualAssistantSettingsPage
} from '../page-objects/virtual-assistant-page';
import { smokeLabel } from '../helpers/smoke-data';
import { SMOKE_DOCUMENTS } from '../helpers/test-documents';

test.describe('Virtual Assistant Settings smoke @smoke', () => {
  test('navigates all settings sidebar sections', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectPageShell();
    await settingsPage.navigateAllSettingsSections();
  });

  test('settings knowledge base documents upload surface works', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const kbName = smokeLabel('kb-docs');
    const accountName = smokeLabel('kb-acct');
    const fileName = 'smoke-doc-a.pdf';

    trackCleanup(async () => {
      await settingsPage.deleteKnowledgeBaseIfPresent(kbName);
    });

    await settingsPage.goto();
    await settingsPage.openAddKnowledgeBaseEditor();
    await settingsPage.createKnowledgeBase({
      name: kbName,
      purpose: 'Smoke test knowledge base for documents upload.'
    });

    await settingsPage.openKnowledgeBaseEditor(kbName);
    await settingsPage.openKnowledgeBaseAddDocuments();
    await settingsPage.expectKnowledgeBaseDocumentUploadSurface();
    await settingsPage.prepareKnowledgeBaseDocumentUpload({
      filePath: SMOKE_DOCUMENTS[0],
      accountName,
      fileName
    });

    // Prefer a real upload; acceptance allows the prepared upload surface when blocked.
    const attached = await settingsPage.uploadKnowledgeBaseDocument({ fileName });
    if (attached) {
      await expect(page.getByText(/Smoke Test Document A/i).first()).toBeVisible();
    }
    await settingsPage.cancelKnowledgeBaseDocumentUpload();
    await settingsPage.cancelKnowledgeBaseEditor();
  });

  test('settings saves a draft form', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const formName = smokeLabel('form');
    trackCleanup(async () => {
      await settingsPage.deleteForm(formName);
    });

    await settingsPage.goto('forms');
    await settingsPage.openNewFormEditor();
    await settingsPage.createForm({
      name: formName,
      description: 'Smoke test form created by Playwright.'
    });
  });

  test('settings form schema shell loads', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('forms');
    await settingsPage.openNewFormEditor();
    await settingsPage.expectFormEditorTabsShell();
  });

  test('settings escalation groups section loads and opens add group editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Escalation Groups');
    await settingsPage.expectEscalationGroupsSection();
    await settingsPage.openAddEscalationGroupEditor();
  });

  test('settings creates an escalation group and cleans up', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const groupName = smokeLabel('escalation-group');
    trackCleanup(async () => {
      await settingsPage.deleteEscalationGroup(groupName);
    });

    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Escalation Groups');
    await settingsPage.createEscalationGroup({
      name: groupName,
      emails: 'smoke-escalation@example.com',
      when: 'Smoke test: escalate when Playwright creates a draft escalation group.'
    });
    await settingsPage.expectEscalationGroupInList(groupName);
  });

  test('settings transfers section loads and opens add transfer editor', async ({ page }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Transfers');
    await settingsPage.expectTransfersSection();
    await settingsPage.openAddTransferEditor();
  });

  test('settings creates a transfer and cleans up', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const transferName = smokeLabel('transfer');
    trackCleanup(async () => {
      await settingsPage.deleteTransfer(transferName);
    });

    await settingsPage.goto('escalations');
    await settingsPage.goToEscalationsSubSection('Transfers');
    await settingsPage.createTransfer({
      name: transferName,
      when: 'Smoke test: transfer created by Playwright.'
    });
    await settingsPage.expectTransferInList(transferName);
  });

  test('settings creates a trigger and cleans up', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const triggerName = smokeLabel('trigger');
    trackCleanup(async () => {
      await settingsPage.deleteTrigger(triggerName);
    });

    await settingsPage.gotoTriggerAdmin();
    await settingsPage.createTrigger({ name: triggerName });
    await settingsPage.expectTriggerInList(triggerName);
  });

  test('settings creates a verification and cleans up', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const verificationName = smokeLabel('verification');
    trackCleanup(async () => {
      await settingsPage.deleteVerification(verificationName);
    });

    await settingsPage.goto('verifications');
    await settingsPage.createVerification({ name: verificationName });
    await settingsPage.expectVerificationInList(verificationName);
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

  test('live data monitoring panels shell loads', async ({ page }) => {
    const livePage = new VirtualAssistantLivePage(page);
    await livePage.goto();
    await livePage.expectLiveDataPage();
    await livePage.expectMonitoringPanelsShell();
  });

  test('live data remaining panels shell loads', async ({ page }) => {
    const livePage = new VirtualAssistantLivePage(page);
    await livePage.goto();
    await livePage.expectLiveDataPage();
    await livePage.expectRemainingPanelsShell();
  });

  test('realtime page loads with call monitors', async ({ page }) => {
    const realtimePage = new VirtualAssistantRealtimePage(page);
    await realtimePage.goto();
    await realtimePage.expectRealtimePage();
  });
});
