import { expect, test } from '../helpers/smoke-test';
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

  // Gap: Assistants have View/Edit only — no Delete UI (API DELETE returns 405).
  // Cleanup deactivates the created assistant (status=inactive) after verify.
  test('creates a draft assistant via save assistant', async ({ page, trackCleanup }) => {
    const vaPage = new VirtualAssistantPage(page);
    const assistantName = smokeLabel('assistant');
    let assistantId: string | number | undefined;

    trackCleanup(async () => {
      await vaPage.deleteAssistant({ name: assistantName, assistantId });
    });

    await vaPage.goto();
    ({ assistantId } = await vaPage.createAssistant({ name: assistantName }));
    await vaPage.expectAssistantInList(assistantName);
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

  test('add sop opens editor and saves a draft sop', async ({ page, trackCleanup }) => {
    const vaPage = new VirtualAssistantPage(page);
    const sopTitle = smokeLabel('sop');
    trackCleanup(async () => {
      await vaPage.deleteSop(sopTitle);
    });

    await vaPage.goto();
    await vaPage.goToSops();
    await vaPage.openAddSopEditor();
    await vaPage.createSop({
      title: sopTitle,
      description: 'Smoke test SOP created by Playwright',
      steps: 'Step 1: Verify the SOP editor saves successfully.'
    });
  });

  test('sop flow canvas shell loads', async ({ page }) => {
    const vaPage = new VirtualAssistantPage(page);

    await vaPage.goto();
    await vaPage.goToSops();
    await vaPage.openAddSopEditor();
    await vaPage.openSopFlowTab();
    await vaPage.expectSopFlowCanvasShell();
  });

  test('new observer form creates an observer', async ({ page, trackCleanup }) => {
    const observersPage = new VirtualAssistantObserversPage(page);
    const observerName = smokeLabel('observer');
    trackCleanup(async () => {
      await observersPage.deleteObserver(observerName);
    });

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

  test('assistant personality and greetings save and persist', async ({ page, trackCleanup }) => {
    const vaPage = new VirtualAssistantPage(page);
    const assistantName = smokeLabel('personality-assistant');
    const personalityDescription = 'Smoke personality description for Playwright.';
    const defaultGreeting = 'Hello — default smoke greeting.';
    const chatGreeting = 'Hi there — chat smoke greeting.';
    let assistantId: string | number | undefined;

    trackCleanup(async () => {
      await vaPage.deleteAssistant({ name: assistantName, assistantId });
    });

    await vaPage.goto();
    ({ assistantId } = await vaPage.createAssistant({ name: assistantName }));
    await vaPage.fillPersonality({ type: 'Friendly', description: personalityDescription });
    await vaPage.fillGreetings({ defaultGreeting, chatGreeting });
    await vaPage.saveAssistant();

    await vaPage.goto();
    await vaPage.openAssistantEditor(assistantName);
    await vaPage.expectPersonality({ type: 'Friendly', description: personalityDescription });
    await vaPage.expectGreetings({ defaultGreeting, chatGreeting });
  });

  test('assistant activities creates a draft activity and cleans up', async ({ page, trackCleanup }) => {
    const vaPage = new VirtualAssistantPage(page);
    const assistantName = smokeLabel('activity-assistant');
    const activityName = smokeLabel('activity');
    let assistantId: string | number | undefined;

    // Register assistant first so LIFO tears down activity, then assistant.
    trackCleanup(async () => {
      await vaPage.deleteAssistant({ name: assistantName, assistantId });
    });
    trackCleanup(async () => {
      try {
        const activityRow = page.getByRole('row').filter({ hasText: activityName }).first();
        const onActivities = await page
          .getByRole('heading', { name: 'Activities', exact: true })
          .isVisible()
          .catch(() => false);
        if (!onActivities || !(await activityRow.isVisible().catch(() => false))) {
          await vaPage.goto();
          await vaPage.openAssistantEditor(assistantName);
          await vaPage.openActivitiesTab();
        }
        if (await activityRow.isVisible().catch(() => false)) {
          await vaPage.deleteActivity(activityName);
        }
      } catch {
        // Best-effort activity cleanup before assistant teardown.
      }
    });

    await vaPage.goto();
    ({ assistantId } = await vaPage.createAssistant({ name: assistantName }));
    await vaPage.openActivitiesTab();
    await vaPage.createActivity({
      name: activityName,
      channel: 'Send Text/SMS',
      description: 'Smoke test activity created by Playwright.'
    });
    await vaPage.expectActivityInList(activityName);
  });

  test('ask prudens workbench loads', async ({ page }) => {
    const askPage = new AskPrudensPage(page);
    await askPage.goto();
    await askPage.expectPageShell();
    await askPage.expectSessionSidebarControls();
    await askPage.expectWorkbench();
  });

  test('ask prudens session list filters shell remains after type and status change', async ({ page }) => {
    const askPage = new AskPrudensPage(page);
    await askPage.goto();
    await askPage.openSessionSidebar();
    await askPage.dismissSessionLoadErrorIfPresent();

    await askPage.setSessionTypeFilter('Ask Prudens');
    await askPage.setSessionStatusFilter('Draft');
    await askPage.expectSessionListFiltersShell({ type: 'Ask Prudens', status: 'Draft' });

    await askPage.setSessionTypeFilter('Proposal');
    await askPage.expectSessionListFiltersShell({ type: 'Proposal', status: 'Draft' });
  });

  test('ask prudens creates a demo chat session', async ({ page, trackCleanup }) => {
    const askPage = new AskPrudensPage(page);
    const sessionTitle = smokeLabel('ask-prudens-flow');
    trackCleanup(async () => {
      await askPage.deleteSession(sessionTitle);
    });

    await askPage.goto();
    const resourceName = await askPage.startAskPrudensChatSession('Demo', sessionTitle, 'Demo', 'smoke');
    await askPage.expectAskPrudensChatReady(sessionTitle, { accountName: 'Demo', agent: 'Demo' });
    await askPage.expectAskPrudensSessionTabs(resourceName);
    await askPage.expectAskPrudensAgentDialog('Demo');
    await askPage.expectAskPrudensSopDialog();
  });

  test('ask prudens creates a certificate review session', async ({ page, trackCleanup }) => {
    const askPage = new AskPrudensPage(page);
    const sessionTitle = smokeLabel('ask-prudens-cert-review');
    trackCleanup(async () => {
      await askPage.deleteSession(sessionTitle);
    });

    await askPage.goto();
    const resourceName = await askPage.startAskPrudensChatSession(
      'Demo',
      sessionTitle,
      'Certificate Review',
      'smoke'
    );
    await askPage.expectAskPrudensChatReady(sessionTitle, {
      accountName: 'Demo',
      agent: 'Certificate Review'
    });
    await askPage.expectAskPrudensSessionTabs(resourceName);
    await askPage.expectAskPrudensAgentDialog('Certificate Review');
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

  test('settings add knowledge base saves a draft', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const kbName = smokeLabel('kb');
    trackCleanup(async () => {
      await settingsPage.deleteKnowledgeBase(kbName);
    });

    await settingsPage.goto();
    await settingsPage.openAddKnowledgeBaseEditor();
    await settingsPage.createKnowledgeBase({
      name: kbName,
      purpose: 'Smoke test knowledge base created by Playwright.'
    });
  });

  test('settings add tool saves an internal function tool', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const toolName = smokeLabel('tool');
    trackCleanup(async () => {
      await settingsPage.deleteTool(toolName);
    });

    await settingsPage.goto('tools');
    await settingsPage.openAddToolEditor();
    await settingsPage.createTool({
      name: toolName,
      description: 'Smoke test tool created by Playwright.'
    });
  });

  test('settings add tool saves an API tool', async ({ page, trackCleanup }) => {
    const settingsPage = new VirtualAssistantSettingsPage(page);
    const toolName = smokeLabel('api-tool');
    trackCleanup(async () => {
      await settingsPage.deleteTool(toolName);
    });

    await settingsPage.goto('tools');
    await settingsPage.openAddToolEditor();
    await settingsPage.createApiTool({
      name: toolName,
      description: 'Smoke test API tool created by Playwright.',
      method: 'GET',
      endpoint: 'https://httpbin.org/get'
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
