import { test } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 5: Add Resources', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const purposeText = `QA Automation Purpose ${randomSuffix}`;

  test('adding a purpose after selecting an account then adding new resources', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.selectAccount('QA Automation');
    await proposalPage.fillPurpose(purposeText);
    await proposalPage.addDocuments([
      'tests/documents/sample1.pdf',
      'tests/documents/sample2.pdf'
    ]);

    console.log(`Purpose added: ${purposeText}`);
    console.log('Resources added successfully');
  });
});
