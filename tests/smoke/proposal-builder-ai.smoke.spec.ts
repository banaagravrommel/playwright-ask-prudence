import { test } from '../helpers/smoke-test';
import { ProposalBuilderPage } from '../page-objects/proposal-builder-page';
import { smokeLabel } from '../helpers/smoke-data';
import { SMOKE_DOCUMENTS } from '../helpers/test-documents';

test.describe('Proposal Builder AI smoke @smoke-ai', () => {
  test('creates a proposal session, uploads documents, and generates a proposal', async ({
    page,
    trackCleanup
  }) => {
    test.setTimeout(360000);

    const proposalTitle = smokeLabel('proposal');
    const proposalPage = new ProposalBuilderPage(page);
    trackCleanup(async () => {
      await proposalPage.deleteSession(proposalTitle);
    });

    await proposalPage.goto();
    await proposalPage.startProposalSession('Demo', proposalTitle, [...SMOKE_DOCUMENTS]);
    await proposalPage.generateProposal();
    await proposalPage.expectProposalGenerationComplete();
  });
});
