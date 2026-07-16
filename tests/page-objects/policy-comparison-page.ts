import { expect, type Locator, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';

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
  readonly accountSearchInput: Locator;
  readonly agentSelect: Locator;
  readonly sessionTitleInput: Locator;
  readonly createSessionButton: Locator;

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
    this.accountSearchInput = page.getByRole('textbox', { name: /Search accounts/i });
    this.agentSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Certificate Review' }) });
    this.sessionTitleInput = page.getByRole('textbox', { name: /Optional title/i });
    this.createSessionButton = page.getByRole('button', { name: /Create Session/i });
  }

  async goto() {
    await this.page.goto('/aegis/policy-comparison');
    await this.page.waitForURL(/\/aegis\/policy-comparison/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/policy-comparison/,
      visibleText: [/Policy Comparison/i],
      headings: ['Policy Comparisons'],
      buttons: [/New/i],
      textboxes: [/Search by comparison name/i],
      columnHeaders: ['Account', 'Comparison Name', 'Status', 'E&O Risk', 'Resources', 'Updated', 'Actions']
    });
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

  async startNewComparison(comparisonName: string) {
    await this.page.getByRole('button', { name: '+ New' }).first().click();
    await this.fillComparisonName(comparisonName);
  }

  async pickAccount(accountName: string) {
    await expect(this.accountSearchInput).toBeVisible();
    await this.accountSearchInput.fill(accountName);
    await this.page.waitForTimeout(1500);

    const accountRow = this.page.getByRole('row').filter({ hasText: accountName }).first();
    await expect(accountRow).toBeVisible({ timeout: 15000 });

    const selectButton = accountRow.getByRole('button').last();
    if (await selectButton.isVisible()) {
      await selectButton.click();
    } else {
      await accountRow.click();
    }

    await expect(this.page.getByRole('heading', { name: new RegExp(`Comparison — ${accountName}`, 'i') })).toBeVisible({ timeout: 15000 });
  }

  async configureSession(options: { agent?: string; title: string; documents?: string[] }) {
    const agent = options.agent ?? 'Comparison';
    await expect(this.agentSelect).toBeVisible();
    await this.agentSelect.selectOption({ label: agent });
    await this.sessionTitleInput.fill(options.title);

    if (options.documents?.length) {
      const sessionPanel = this.page.getByRole('heading', { name: /Comparison —/ }).locator('xpath=ancestor::div[3]');
      await sessionPanel.getByRole('button', { name: '+ New' }).click();
      await this.page.getByText('Document', { exact: true }).click();
      await this.page.locator('input[type="file"]').setInputFiles(options.documents);
      await this.page.getByRole('button', { name: /Upload/i }).click();
      await expect(this.page.getByText('Completed', { exact: true }).first()).toBeVisible({ timeout: 120000 });
      await this.page.getByRole('button', { name: 'Done' }).click();
    }
  }

  async createSession() {
    await expect(this.createSessionButton).toBeEnabled();
    await this.createSessionButton.click();
    await expect(this.page.getByRole('button', { name: 'Chat' })).toBeVisible({ timeout: 30000 });
  }

  async attachSources(filePaths: string[]) {
    await this.page.getByRole('button', { name: 'Sources' }).click();
    await this.page.getByText('Add sources').click();

    const attachPanel = this.page.locator('text=Attach').locator('xpath=ancestor::div[3]');
    await attachPanel.getByRole('button', { name: '+ New' }).click();
    await this.page.getByText('Document', { exact: true }).click();
    await this.page.locator('input[type="file"]').setInputFiles(filePaths);
    await this.page.getByRole('button', { name: /Upload/i }).click();
    await expect(this.page.getByText('Completed', { exact: true }).first()).toBeVisible({ timeout: 120000 });
    await this.page.getByRole('button', { name: 'Done' }).click();

    const attachButton = this.page.getByRole('button', { name: /Attach/i });
    await expect(attachButton).toBeEnabled({ timeout: 30000 });
    await attachButton.click();
    await this.page.getByRole('button', { name: 'Chat' }).click();
  }

  async startComparisonSession(accountName: string, title: string, documents?: string[]) {
    await this.page.getByRole('button', { name: '+ New' }).first().click();
    await this.pickAccount(accountName);
    await this.configureSession({ title });
    await this.createSession();
    if (documents?.length) {
      await this.attachSources(documents);
    }
  }

  async uploadDocumentsForEditor(filePaths: string[]) {
    const addResourceButton = this.page.getByRole('button', {
      name: '+ New',
      description: 'Add new resource',
      exact: true
    });
    if (await addResourceButton.isVisible()) {
      await addResourceButton.click();
    } else {
      await this.page.getByRole('button', { name: '+ New', exact: true }).last().click();
    }
    await this.page.getByText('Document', { exact: true }).click();
    await this.page.locator('input[type="file"]').setInputFiles(filePaths);
    const uploadButton = this.page.getByRole('button', { name: new RegExp(`Upload ${filePaths.length} Documents?`, 'i') });
    await expect(uploadButton).toBeVisible();
    await uploadButton.click();
    await expect(this.page.getByText('Completed', { exact: true }).first()).toBeVisible({ timeout: 120000 });
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async generateComparison() {
    const runComparison = this.page.getByRole('button', { name: /Run Comparison/i });
    const generateButton = this.page.getByRole('button', { name: /^Generate$|Generate Comparison/i });

    if (await runComparison.isVisible()) {
      await expect(runComparison).toBeEnabled({ timeout: 120000 });
      await runComparison.click();
      return;
    }

    await expect(generateButton.first()).toBeEnabled({ timeout: 120000 });
    await generateButton.first().click();
  }

  async expectComparisonResults() {
    await expect(this.page.getByRole('button', { name: 'Canvas' })).toBeVisible({ timeout: 300000 });
    await expect(this.page.locator('body')).toContainText(
      /Executive Summary|Top Differences|Policy Comparison Results|Recommendations|Bottom Line/i,
      { timeout: 300000 }
    );
  }
}
