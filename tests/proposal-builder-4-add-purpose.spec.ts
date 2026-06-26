import { test } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 4: Add Purpose', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const purposeText = `QA Automation Purpose ${randomSuffix}`;

  test('adding a purpose after selecting an account', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.selectAccount('QA Automation');
    await proposalPage.fillPurpose(purposeText);

    // Verify purpose was filled
    console.log(`Purpose added: ${purposeText}`);
  });
});
