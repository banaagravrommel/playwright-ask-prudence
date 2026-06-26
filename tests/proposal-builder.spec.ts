import { test } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Prudens proposal builder', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const accountName = `QA Automation ${randomSuffix}`;
  const purposeText = `QA Automation ${randomSuffix}`;

  test('creates a new account and fills proposal purpose', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('rav@hubstart.io', 'password');

    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.addNewAccount(accountName);
    await proposalPage.fillPurpose(purposeText);
    await proposalPage.addDocuments([
      'tests/documents/sample1.pdf',
      'tests/documents/sample2.pdf'
    ]);
    await proposalPage.generateProposal();
    await page.waitForTimeout(2000);

    console.log(`Proposal builder used account name: ${accountName}`);
    console.log(`Proposal builder used purpose: ${purposeText}`);
    console.log('Proposal generated successfully');
  });
});
