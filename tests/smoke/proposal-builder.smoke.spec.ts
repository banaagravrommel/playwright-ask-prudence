import { test } from '@playwright/test';
import { ProposalBuilderPage } from '../page-objects/proposal-builder-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Proposal Builder smoke @smoke', () => {
  test('creates a draft session via create session and cleans up', async ({ page }) => {
    test.setTimeout(120000);

    const proposalTitle = smokeLabel('proposal');
    const proposalPage = new ProposalBuilderPage(page);

    try {
      await proposalPage.goto();
      await proposalPage.startProposalSession('Demo', proposalTitle);
      await proposalPage.expectSessionInList(proposalTitle);
    } finally {
      await proposalPage.deleteSession(proposalTitle);
    }
  });
});
