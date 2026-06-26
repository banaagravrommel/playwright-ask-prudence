import { expect, type Locator, type Page } from '@playwright/test';

export class AppShellPage {
  readonly page: Page;
  readonly policyComparisonLink: Locator;
  readonly proposalBuilderLink: Locator;
  readonly virtualAssistanceLink: Locator;
  readonly askPrudensLink: Locator;
  readonly fnolLink: Locator;
  readonly copilotButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.policyComparisonLink = page.getByRole('link', { name: /Policy Comparison/i });
    this.proposalBuilderLink = page.getByRole('link', { name: /Proposal Builder/i });
    this.virtualAssistanceLink = page.getByRole('link', { name: /Virtual Assistance/i });
    this.askPrudensLink = page.getByRole('link', { name: /Ask Prudens/i });
    this.fnolLink = page.getByRole('link', { name: /FNOL/i });
    this.copilotButton = page.getByRole('button', { name: /Open Aegis Copilot/i });
  }

  async expectAuthenticatedShell() {
    await expect(this.page).toHaveURL(/\/(aegis|virtual-assistant)/);
    await expect(this.policyComparisonLink.first()).toBeVisible({ timeout: 60000 });
  }

  async goToVirtualAssistant() {
    await this.askPrudensLink.first().click();
    await expect(this.page).toHaveURL(/\/virtual-assistant/);
  }

  async goToPolicyComparison() {
    await this.policyComparisonLink.first().click();
    await expect(this.page).toHaveURL(/\/aegis\/policy-comparison/);
  }

  async goToProposalBuilder() {
    await this.proposalBuilderLink.first().click();
    await expect(this.page).toHaveURL(/\/aegis\/proposal-builder/);
  }
}
