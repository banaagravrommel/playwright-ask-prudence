import { test, expect } from '@playwright/test';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 1: Create Draft', () => {
  test('click create a proposal draft button and verify the result', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    // Verify the proposal draft interface is visible
    await expect(page.locator('text=Proposal Builder').first()).toBeVisible();
    await expect(page.locator('text=Proposal Configuration')).toBeVisible();

    console.log('Proposal draft created successfully');
  });
});
