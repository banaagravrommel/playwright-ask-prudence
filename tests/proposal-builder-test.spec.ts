import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { ProposalBuilderPage } from './page-objects/proposal-builder-page';

test.describe('Proposal Builder - Step 1: Create Draft', () => {
  test('click create a proposal draft button and verify the result', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    await expect(page.locator('text=Proposal Builder').first()).toBeVisible();
    await expect(page.locator('text=Proposal Configuration')).toBeVisible();

    console.log('Proposal draft created successfully');
  });
});

test.describe('Proposal Builder - Step 2: Add Account', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const accountName = `QA Automation ${randomSuffix}`;

  test('adding a new account', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();
    await proposalPage.addNewAccount(accountName);

    console.log(`Account created: ${accountName}`);
  });
});

test.describe('Proposal Builder - Step 3: Select Account', () => {
  test('selecting an account', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    await page.getByPlaceholder('Select or search account...').click();
    await page.getByRole('option').first().click();

    console.log('Account selected successfully');
  });
});

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

    console.log(`Purpose added: ${purposeText}`);
  });
});

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

test.describe('Proposal Builder end-to-end', () => {
  test('creates a draft, adds an account, fills purpose, uploads resources, and generates a proposal', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('rav@hubstart.io', 'password');

    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const accountName = `QA Automation ${randomSuffix}`;
    const purposeText = `QA Automation Purpose ${randomSuffix}`;

    await proposalPage.addNewAccount(accountName);
    await proposalPage.selectAccount(accountName);
    await proposalPage.fillPurpose(purposeText);
    await proposalPage.addDocuments([
      'tests/documents/sample1.pdf',
      'tests/documents/sample2.pdf'
    ]);
    await proposalPage.generateProposal();

    await expect(page.locator('text=Proposal Builder').first()).toBeVisible();

    console.log(`Proposal builder used account name: ${accountName}`);
    console.log(`Proposal builder used purpose: ${purposeText}`);
    console.log('Proposal generated successfully');
  });
});
