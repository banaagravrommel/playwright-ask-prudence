import { test, expect } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 3: Select Account', () => {
  test('selecting an account', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    // Select the first account in the dropdown
    await page.getByPlaceholder('Select or search account...').click();
    await page.getByRole('option').first().click();

    console.log('Account selected successfully');
  });
});
