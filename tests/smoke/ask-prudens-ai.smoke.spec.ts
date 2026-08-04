import { test } from '../helpers/smoke-test';
import { AskPrudensPage } from '../page-objects/virtual-assistant-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Ask Prudens AI smoke @smoke-ai', () => {
  test('creates an ask prudens chat session and receives an AI response', async ({ page, trackCleanup }) => {
    test.setTimeout(360000);

    const sessionTitle = smokeLabel('ask-prudens');
    const prompt = 'What is general liability insurance in one sentence?';
    const askPage = new AskPrudensPage(page);
    trackCleanup(async () => {
      await askPage.deleteSession(sessionTitle);
    });

    await askPage.goto();
    await askPage.startAskPrudensChatSession('Demo', sessionTitle);
    await askPage.sendMessage(prompt);
    await askPage.expectChatResponse(prompt);
  });
});
