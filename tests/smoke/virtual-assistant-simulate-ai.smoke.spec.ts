import { test } from '@playwright/test';
import { VirtualAssistantSettingsPage } from '../page-objects/virtual-assistant-page';

test.describe('Virtual Assistant Simulate chat smoke @smoke-ai', () => {
  test('settings simulate test chat sends a message and receives a response', async ({ page }) => {
    test.setTimeout(360000);

    const settingsPage = new VirtualAssistantSettingsPage(page);
    const message = 'Hello from Playwright simulate smoke — reply with one short sentence.';

    try {
      await settingsPage.goto('simulate');
      await settingsPage.openFirstAgentTestFromSituations();
      await settingsPage.sendSimulateTestMessage(message);
      await settingsPage.expectSimulateTestResponse(message);
    } finally {
      await settingsPage.clearSimulateTestConversation();
      await settingsPage.leaveSimulateTestChat();
    }
  });
});
