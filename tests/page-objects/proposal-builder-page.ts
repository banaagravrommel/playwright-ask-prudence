import { expect, type Locator, type Page } from '@playwright/test';

export class ProposalBuilderPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly addNewAccountButton: Locator;
  readonly createAccountPanel: Locator;
  readonly accountNameInput: Locator;
  readonly createButton: Locator;
  readonly purposeInput: Locator;
  readonly accountCombobox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.locator('button:has-text("+ New"), button:has-text("New")').first();
    this.addNewAccountButton = page.locator('button:has-text("+ Add New Account"), button:has-text("Add New Account")').first();
    this.createAccountPanel = page.locator('text=Create New Account').first().locator('xpath=ancestor::div[1]');
    this.accountNameInput = this.createAccountPanel.locator('input').first();
    this.createButton = this.createAccountPanel.getByRole('button', { name: /create/i }).first();
    this.purposeInput = page.locator(
      'textarea[placeholder*="Annual renewal proposal"], input[placeholder*="Annual renewal proposal"], textarea[aria-label*="Purpose"], input[aria-label*="Purpose"]'
    ).first();
    this.accountCombobox = page.getByPlaceholder('Select or search account...');
  }

  async goto() {
    await this.page.goto('https://test.getprudens.ai/aegis/proposal-builder', { timeout: 120000 });
    await this.page.waitForURL(/\/aegis\/proposal-builder/);
    await this.page.waitForLoadState('networkidle');
  }

  async openNewProposal() {
    await expect(this.newButton).toBeVisible();
    await expect(this.newButton).toBeEnabled();
    await this.newButton.click();
  }

  async addNewAccount(accountName: string) {
    await expect(this.addNewAccountButton).toBeVisible();
    await this.addNewAccountButton.click();
    await expect(this.createAccountPanel).toBeVisible();
    await expect(this.accountNameInput).toBeVisible();
    await this.accountNameInput.fill(accountName);
    await expect(this.accountNameInput).toHaveValue(accountName);
    await expect(this.createButton).toBeEnabled();
    await this.createButton.click();

    const accountCreatedDialog = this.page.locator('text=Account created').first();
    await expect(accountCreatedDialog).toBeVisible({ timeout: 10000 });

    const accountCreatedOkButton = this.page.getByRole('button', { name: /OK/ }).first();
    await expect(accountCreatedOkButton).toBeVisible();
    await expect(accountCreatedOkButton).toBeEnabled();
    await accountCreatedOkButton.click();

    await expect(accountCreatedDialog).toBeHidden();
    await this.page.waitForLoadState('networkidle');
  }

  async fillPurpose(purposeText: string) {
    await expect(this.purposeInput).toBeVisible();
    await this.purposeInput.fill(purposeText);
    await expect(this.purposeInput).toHaveValue(purposeText);
  }

  async selectAccount(accountName: string) {
    await expect(this.accountCombobox).toBeVisible();
    await this.accountCombobox.click();
    await this.page.waitForTimeout(500);

    const accountOption = this.page.locator('[role="option"], [role="listbox"] li, div[role="listbox"] > div').filter({ hasText: accountName }).first();
    await expect(accountOption).toBeVisible({ timeout: 10000 });
    await accountOption.click();
    await this.page.waitForLoadState('networkidle');
  }

  async addDocuments(filePaths: string[]) {
    await this.page.getByRole('button', { name: '+ New' }).click();
    await this.page.getByText('Document', { exact: true }).click();
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePaths);
    await expect(this.page.getByText(filePaths[0].split('/').pop() || filePaths[0])).toBeVisible();
    await this.page.getByRole('button', { name: /Upload/i }).click();
    await expect(this.page.locator('h3').filter({ hasText: 'Processing Document' })).toBeVisible();
    await expect(this.page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 60000 });
    await this.page.getByRole('button', { name: 'Done' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async generateProposal() {
    const generateButton = this.page.locator('button:has-text("Generate Proposal"), button:has-text("generate proposal")').first();
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();
    await generateButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
