import { test, expect } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';
import { AppShellPage } from '../page-objects/app-shell-page';
import { ProposalBuilderPage } from '../page-objects/proposal-builder-page';

test.describe('Navigation smoke @smoke', () => {
  test('policy comparison list page loads', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.goto('/aegis/policy-comparison');

    await expectPageBaseline(page, {
      url: /\/aegis\/policy-comparison/,
      visibleText: [/Policy Comparison/i],
      headings: ['Policy Comparisons'],
      buttons: [/New/i],
      textboxes: [/Search by comparison name/i],
      columnHeaders: ['Account', 'Comparison Name', 'Status', 'E&O Risk', 'Resources', 'Updated', 'Actions']
    });
  });

  test('proposal builder workbench loads', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.goto('/aegis/proposal-builder');

    await expectPageBaseline(page, {
      url: /\/aegis\/proposal-builder/,
      visibleText: [/Proposal Builder/i, /Create and send professional insurance proposals/i],
      headings: ['Proposals'],
      buttons: [/New/i],
      columnHeaders: ['Account', 'Name', 'Status', 'Created', 'Actions']
    });
  });

  test('proposal builder opens new proposal account picker', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();
    await proposalPage.openNewProposal();

    await expect(page.getByRole('heading', { name: /Pick an account for/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create new account/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Search accounts/i })).toBeVisible();
  });

  test('navigate between policy comparison and proposal builder', async ({ page }) => {
    const shell = new AppShellPage(page);

    await shell.goto('/aegis/policy-comparison');

    await shell.goToProposalBuilder();
    await expect(page.getByText('Proposal Builder').first()).toBeVisible();

    await shell.goToPolicyComparison();
    await expect(page.getByRole('heading', { name: 'Policy Comparisons' })).toBeVisible();
  });

  test('sidebar exposes product modules and access states', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.goto('/aegis/policy-comparison');

    await shell.expectProductModules();
    await shell.expectAdminModuleStates();
  });

  test('sidebar expands grouped product modules', async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.goto('/aegis/policy-comparison');

    await shell.expectVirtualAssistanceSubNavigation();
    await shell.expectFormAutomationSubNavigation();
    await shell.expectUnderwritingSubNavigation();
  });
});
