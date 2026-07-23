import { test } from '@playwright/test';
import { AskPrudensPage } from '../page-objects/virtual-assistant-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Ask Prudens AI smoke @smoke-ai', () => {
  test('creates an ask prudens chat session and receives an AI response', async ({ page }) => {
    test.setTimeout(360000);

    const sessionTitle = smokeLabel('ask-prudens');
    const prompt = 'What is general liability insurance in one sentence?';
    const askPage = new AskPrudensPage(page);

    try {
      await askPage.goto();
      await askPage.startAskPrudensChatSession('Demo', sessionTitle);
      await askPage.sendMessage(prompt);
      await askPage.expectChatResponse(prompt);
    } finally {
      await askPage.deleteSession(sessionTitle);
    }
  });
});
