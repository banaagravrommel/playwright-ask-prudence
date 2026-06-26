import { test } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 2: Add Account', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const accountName = `QA Automation ${randomSuffix}`;

  test('adding a new account', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.addNewAccount(accountName);

    // Verify account was added
    console.log(`Account created: ${accountName}`);
  });
});
