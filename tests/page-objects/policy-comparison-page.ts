import { expect, type Locator, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';
import { deleteRowByName } from '../helpers/smoke-cleanup';

export class PolicyComparisonPage {
  readonly page: Page;
  readonly accountSearchInput: Locator;
  readonly agentSelect: Locator;
  readonly sessionTitleInput: Locator;
  readonly createSessionButton: Locator;

  constructor(page: Page) {
    this.page = page;
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
    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/quoting\/ai-sessions\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await expect(this.createSessionButton).toBeEnabled();
    await this.createSessionButton.click();
    await saveResponse;
    await expect(this.page.getByRole('button', { name: 'Chat' })).toBeVisible({ timeout: 30000 });
  }

  async searchByComparisonName(name: string) {
    const search = this.page.getByPlaceholder(/Search by comparison name/i);
    await expect(search).toBeVisible({ timeout: 15000 });
    await search.fill(name);
    await this.page.waitForTimeout(1500);
  }

  async expectSessionInList(title: string) {
    await this.goto();
    await this.expectListPage();
    await this.searchByComparisonName(title);
    await expect(this.page.getByRole('row').filter({ hasText: title }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteSession(title: string) {
    await this.goto();
    await this.expectListPage();
    await this.searchByComparisonName(title);
    await deleteRowByName(this.page, title, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
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
