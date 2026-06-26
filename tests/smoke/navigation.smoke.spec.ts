import { test, expect } from '@playwright/test';
import { AppShellPage } from '../page-objects/app-shell-page';
import { PolicyComparisonPage } from '../page-objects/policy-comparison-page';
import { ProposalBuilderPage } from '../page-objects/proposal-builder-page';

test.describe('Navigation smoke @smoke', () => {
  test('policy comparison list page loads', async ({ page }) => {
    const policyPage = new PolicyComparisonPage(page);
    await policyPage.goto();

    await expect(page.getByText('Policy Comparison').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Policy Comparisons' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New' }).first()).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Search by comparison name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Comparison Name' })).toBeVisible();
  });

  test('proposal builder workbench loads', async ({ page }) => {
    const proposalPage = new ProposalBuilderPage(page);
    await proposalPage.goto();

    await expect(page.getByText('Proposal Builder').first()).toBeVisible();
    await expect(page.getByText(/Create and send professional insurance proposals/i)).toBeVisible();
    await expect(page.getByRole('button', { name: '+ New' }).first()).toBeVisible();
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
    const policyPage = new PolicyComparisonPage(page);

    await policyPage.goto();
    await shell.expectAuthenticatedShell();

    await shell.goToProposalBuilder();
    await expect(page.getByText('Proposal Builder').first()).toBeVisible();

    await shell.goToPolicyComparison();
    await expect(page.getByRole('heading', { name: 'Policy Comparisons' })).toBeVisible();
  });

  test('sidebar exposes core product modules', async ({ page }) => {
    const policyPage = new PolicyComparisonPage(page);
    await policyPage.goto();

    const shell = new AppShellPage(page);
    await expect(shell.proposalBuilderLink.first()).toBeVisible();
    await expect(shell.fnolLink.first()).toBeVisible();
    await expect(shell.copilotButton).toBeVisible();
  });
});
