import { test } from '@playwright/test';
import {
  IntakeMatchPage,
  UnderwritingCarriersPage,
  UnderwritingGuidePage,
  UnderwritingOverviewPage,
  UnderwritingPackagesPage,
  UnderwritingSubmissionsPage
} from '../page-objects/underwriting-page';

test.describe('Underwriting smoke @smoke', () => {
  test('intake match list page loads', async ({ page }) => {
    const intakePage = new IntakeMatchPage(page);
    await intakePage.goto();
    await intakePage.expectListPage();
  });

  test('submissions list page loads', async ({ page }) => {
    const submissionsPage = new UnderwritingSubmissionsPage(page);
    await submissionsPage.goto();
    await submissionsPage.expectListPage();
  });

  test('packages list page loads', async ({ page }) => {
    const packagesPage = new UnderwritingPackagesPage(page);
    await packagesPage.goto();
    await packagesPage.expectListPage();
  });

  test('carriers list page loads', async ({ page }) => {
    const carriersPage = new UnderwritingCarriersPage(page);
    await carriersPage.goto();
    await carriersPage.expectListPage();
  });

  test('guide page loads', async ({ page }) => {
    const guidePage = new UnderwritingGuidePage(page);
    await guidePage.goto();
    await guidePage.expectPageShell();
  });

  test('overview page loads', async ({ page }) => {
    const overviewPage = new UnderwritingOverviewPage(page);
    await overviewPage.goto();
    await overviewPage.expectPageShell();
  });
});
