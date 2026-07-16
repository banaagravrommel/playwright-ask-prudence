import { expect, type Locator, type Page } from '@playwright/test';

type AccessBadge = 'Admin' | 'S-Admin' | 'Locked';

export class AppShellPage {
  readonly page: Page;
  readonly policyComparisonLink: Locator;
  readonly proposalBuilderLink: Locator;
  readonly virtualAssistanceLink: Locator;
  readonly askPrudensLink: Locator;
  readonly formAutomationLink: Locator;
  readonly underwritingLink: Locator;
  readonly bindingBillingLink: Locator;
  readonly coiEoiEndorsementsLink: Locator;
  readonly fnolLink: Locator;
  readonly crmAmsIntegrationLink: Locator;
  readonly invoiceCreatorLink: Locator;
  readonly settingsLink: Locator;
  readonly copilotButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.policyComparisonLink = page.getByRole('link', { name: /Policy Comparison/i });
    this.proposalBuilderLink = page.getByRole('link', { name: /Proposal Builder/i });
    this.virtualAssistanceLink = page.getByRole('link', { name: /Virtual Assistance/i });
    this.askPrudensLink = page.getByRole('link', { name: /Ask Prudens/i });
    this.formAutomationLink = page.getByRole('link', { name: /Form Automation/i });
    this.underwritingLink = page.getByRole('link', { name: /Underwriting/i });
    this.bindingBillingLink = page.getByRole('link', { name: /Binding and Billing/i });
    this.coiEoiEndorsementsLink = page.getByRole('link', { name: /COI, EOI and Endorsements/i });
    this.fnolLink = page.getByRole('link', { name: /FNOL/i });
    this.crmAmsIntegrationLink = page.getByRole('link', { name: /CRM AMS Integration/i });
    this.invoiceCreatorLink = page.getByRole('link', { name: /Invoice Creator/i });
    this.settingsLink = page.getByRole('link', { name: /Settings/i });
    this.copilotButton = page.getByRole('button', { name: /Open Aegis Copilot/i });
  }

  async expectAuthenticatedShell() {
    await expect(this.page).toHaveURL(/\/(aegis|virtual-assistant)/);
    await expect(this.policyComparisonLink.first()).toBeVisible({ timeout: 60000 });
    await expect(this.copilotButton).toBeVisible();
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForURL(new RegExp(escapeRegExp(path)));
    await this.page.waitForLoadState('networkidle');
    await this.expectAuthenticatedShell();
  }

  async expectProductModules() {
    await expect(this.virtualAssistanceLink.first()).toBeVisible();
    await expect(this.askPrudensLink.first()).toBeVisible();
    await expect(this.policyComparisonLink.first()).toBeVisible();
    await expect(this.proposalBuilderLink.first()).toBeVisible();
    await expect(this.formAutomationLink.first()).toBeVisible();
    await expect(this.underwritingLink.first()).toBeVisible();
    await expect(this.crmAmsIntegrationLink.first()).toBeVisible();
    await expect(this.invoiceCreatorLink.first()).toBeVisible();
  }

  async expectAccessState(moduleLink: Locator, badges: AccessBadge[]) {
    const link = moduleLink.first();
    await expect(link).toBeVisible();

    for (const badge of badges) {
      await expect(link).toContainText(badge);
    }
  }

  async expectAdminModuleStates() {
    await this.expectAccessState(this.bindingBillingLink, ['S-Admin', 'Locked']);
    await this.expectAccessState(this.coiEoiEndorsementsLink, ['S-Admin']);
    await this.expectAccessState(this.fnolLink, ['S-Admin']);
    await this.expectAccessState(this.settingsLink, ['Admin']);
  }

  async expectVirtualAssistanceSubNavigation() {
    await this.expandModuleIfNeeded(this.virtualAssistanceLink, 'Assistants');
    await expect(this.page.getByRole('link', { name: 'Assistants' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Live Data' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Realtime' })).toBeVisible();
  }

  async expectFormAutomationSubNavigation() {
    await this.expandModuleIfNeeded(this.formAutomationLink, 'Form Fill Templates');
    await this.expectSidebarLinkByHref('/aegis/form-fill-template', /Form Fill Templates/i);
    await this.expectSidebarLinkByHref('/aegis/form-fill', /Form Fill/i);
  }

  async expectUnderwritingSubNavigation() {
    await this.expandModuleIfNeeded(this.underwritingLink, 'Intake Match');
    await this.expectSidebarLinkByHref('/aegis/underwriting-automation/intake-match', /Intake Match/i);
    await this.expectSidebarLinkByHref('/aegis/form-submissions/submissions', /Submissions/i);
    await this.expectSidebarLinkByHref('/aegis/form-submissions', /Packages/i);
    await this.expectSidebarLinkByHref('/aegis/underwriting-automation/settings', /Carriers/i);
    await this.expectSidebarLinkByHref('/aegis/underwriting-automation/guides', /Guide/i);
    await this.expectSidebarLinkByHref('/aegis/underwriting-automation/about', /Overview/i);
  }

  private async expandModuleIfNeeded(moduleLink: Locator, firstSubLinkName: string) {
    const firstSubLink = this.page.getByRole('link', { name: firstSubLinkName });
    if (await firstSubLink.isVisible()) {
      return;
    }

    await moduleLink.first().click();
    await expect(firstSubLink).toBeVisible();
  }

  private async expectSidebarLinkByHref(path: string, text: string | RegExp) {
    await expect(this.page.locator(`a[href$="${path}"]`).filter({ hasText: text }).first()).toBeVisible();
  }

  async goToVirtualAssistant() {
    await this.expandModuleIfNeeded(this.virtualAssistanceLink, 'Assistants');
    await this.page.getByRole('link', { name: 'Assistants' }).click();
    await expect(this.page).toHaveURL(/\/virtual-assistant\/?$/);
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
