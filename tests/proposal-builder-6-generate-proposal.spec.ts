import { test } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 6: Generate Proposal', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const purposeText = `QA Automation Purpose ${randomSuffix}`;

  test('adding purpose, resources, and generating the proposal', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.selectAccount('QA Automation');
    await proposalPage.fillPurpose(purposeText);
    await proposalPage.addDocuments([
      'tests/documents/sample1.pdf',
      'tests/documents/sample2.pdf'
    ]);
    await proposalPage.generateProposal();

    console.log(`Purpose added: ${purposeText}`);
    console.log('Proposal generated successfully');
  });
});
