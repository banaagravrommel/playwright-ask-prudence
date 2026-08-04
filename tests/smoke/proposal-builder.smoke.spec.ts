import { test } from '../helpers/smoke-test';
import { ProposalBuilderPage } from '../page-objects/proposal-builder-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Proposal Builder smoke @smoke', () => {
  test('creates a draft session via create session and cleans up', async ({ page, trackCleanup }) => {
    test.setTimeout(120000);

    const proposalTitle = smokeLabel('proposal');
    const proposalPage = new ProposalBuilderPage(page);
    trackCleanup(async () => {
      await proposalPage.deleteSession(proposalTitle);
    });

    await proposalPage.goto();
    await proposalPage.startProposalSession('Demo', proposalTitle);
    await proposalPage.expectSessionInList(proposalTitle);
  });
});
