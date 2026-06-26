import { expect, type Locator, type Page } from '@playwright/test';

export class ProposalBuilderPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly accountSearchInput: Locator;
  readonly agentSelect: Locator;
  readonly sessionTitleInput: Locator;
  readonly createSessionButton: Locator;
  readonly generateProposalButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.getByRole('button', { name: '+ New' }).first();
    this.accountSearchInput = page.getByRole('textbox', { name: /Search accounts/i });
    this.agentSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Certificate Review' }) });
    this.sessionTitleInput = page.getByRole('textbox', { name: /Optional title/i });
    this.createSessionButton = page.getByRole('button', { name: /Create Session/i });
    this.generateProposalButton = page.getByRole('button', { name: /Generate Proposal/i });
  }

  async goto() {
    await this.page.goto('/aegis/proposal-builder', { timeout: 120000 });
    await this.page.waitForURL(/\/aegis\/proposal-builder/);
    await this.page.waitForLoadState('networkidle');
  }

  async openNewProposal() {
    await expect(this.newButton).toBeVisible();
    await expect(this.newButton).toBeEnabled();
    await this.newButton.click();
    await expect(this.page.getByRole('heading', { name: /Pick an account for/i })).toBeVisible();
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

    await expect(this.page.getByRole('heading', { name: new RegExp(`Proposal — ${accountName}`, 'i') })).toBeVisible({ timeout: 15000 });
  }

  async configureSession(options: { agent?: string; title: string; documents?: string[] }) {
    const agent = options.agent ?? 'Proposal';
    await expect(this.agentSelect).toBeVisible();
    await this.agentSelect.selectOption({ label: agent });
    await this.sessionTitleInput.fill(options.title);

    if (options.documents?.length) {
      const sessionPanel = this.page.getByRole('heading', { name: /Proposal —/ }).locator('xpath=ancestor::div[3]');
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

  async startProposalSession(accountName: string, title: string, documents?: string[]) {
    await this.openNewProposal();
    await this.pickAccount(accountName);
    await this.configureSession({ title, documents });
    await this.createSession();
  }

  async generateProposal() {
    await expect(this.generateProposalButton).toBeVisible();
    await expect(this.generateProposalButton).toBeEnabled();
    await this.generateProposalButton.click();
  }

  async expectProposalGenerationComplete() {
    await expect(this.page.getByRole('button', { name: 'Canvas' })).toBeVisible({ timeout: 300000 });
    const chatInput = this.page.getByPlaceholder(/Ask about proposal/i);
    await expect(chatInput).toBeVisible();

    const bodyText = this.page.locator('body');
    await expect(bodyText).toContainText(/proposal|canvas|draft|summary|coverage/i, { timeout: 300000 });
  }
}
