import { expect, type Locator, type Page } from '@playwright/test';

export class PolicyComparisonPage {
  readonly page: Page;
  readonly newButtons: Locator;
  readonly accountNewButton: Locator;
  readonly accountNameInput: Locator;
  readonly createButton: Locator;
  readonly comparisonNameInput: Locator;
  readonly resourcesNewButton: Locator;
  readonly documentButton: Locator;
  readonly browseFilesInput: Locator;
  readonly uploadDocumentsButton: Locator;
  readonly uploadCompleteLabel: Locator;
  readonly doneButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButtons = page.locator('button:has-text("+ New"), button:has-text("New")');
    this.accountNewButton = page.locator('text=Account').first().locator('xpath=following::button[contains(normalize-space(.), "New")][1]');
    this.accountNameInput = page.locator('input[placeholder*="Enter account name"]').first();
    this.createButton = page.locator('button:has-text("+ Create"), button:has-text("Create")').first();
    this.comparisonNameInput = page.getByRole('textbox', { name: 'e.g., Renewal comparison,' });
    this.resourcesNewButton = page.locator('text=Resources').first().locator('xpath=following::button[contains(normalize-space(.), "New")][1]');
    this.documentButton = page.locator('button:has-text("Document"), button:has-text("document")').first();
    this.browseFilesInput = page.locator('input[type="file"]').first();
    this.uploadDocumentsButton = page.locator('button:has-text("Upload 2 Documents"), button:has-text("Upload Documents"), button:has-text("Upload")').first();
    this.uploadCompleteLabel = page.locator('text=/batch upload complete/i, text=/upload complete/i').first();
    this.doneButton = page.getByRole('button', { name: /Done/i }).first();
    this.saveButton = page.getByRole('button', { name: /Save/i }).first();
  }

  async goto() {
    await this.page.goto('https://test.getprudens.ai/aegis/policy-comparison');
    await this.page.waitForURL(/\/aegis\/policy-comparison/);
    await this.page.waitForLoadState('networkidle');
  }

  async createAccount(accountName: string) {
    await expect(this.newButtons.first()).toBeVisible();
    await this.newButtons.first().click();

    await expect(this.accountNewButton).toBeVisible();
    await this.accountNewButton.click();

    await expect(this.accountNameInput).toBeVisible();
    await this.accountNameInput.fill(accountName);
    await expect(this.accountNameInput).toHaveValue(accountName);

    await expect(this.createButton).toBeVisible();
    await expect(this.createButton).toBeEnabled();
    await this.createButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillComparisonName(comparisonName: string) {
    await expect(this.comparisonNameInput).toBeVisible();
    await this.comparisonNameInput.fill(comparisonName);
    await expect(this.comparisonNameInput).toHaveValue(comparisonName);
  }

  async uploadDocuments(filePaths: string[]) {
    await expect(this.resourcesNewButton).toBeVisible();
    await expect(this.resourcesNewButton).toBeEnabled();
    await this.resourcesNewButton.click();

    await expect(this.documentButton).toBeVisible();
    await this.documentButton.click();

    await expect(this.browseFilesInput).toBeVisible();
    await this.browseFilesInput.setInputFiles(filePaths);

    await expect(this.uploadDocumentsButton).toBeVisible();
    await expect(this.uploadDocumentsButton).toBeEnabled();
    await this.uploadDocumentsButton.click();

    await expect(this.uploadCompleteLabel).toBeVisible({ timeout: 300000 });
    await expect(this.doneButton).toBeVisible({ timeout: 300000 });
    await expect(this.doneButton).toBeEnabled();
    await this.doneButton.click();

    await this.page.waitForLoadState('networkidle');
  }

  async verifyDocumentCount(expectedCount: number) {
    const resourcesSection = this.page.locator('section:has-text("Resources"), div:has-text("Resources")').first();
    await expect(resourcesSection).toBeVisible({ timeout: 10000 });
    const uploadedDocumentLabels = resourcesSection.locator('xpath=.//*[contains(translate(text(), "PDF", "pdf"), ".pdf")]');
    await expect(uploadedDocumentLabels).toHaveCount(expectedCount, { timeout: 10000 });
  }

  async save() {
    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
