import { expect, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';
import { deleteRowByName } from '../helpers/smoke-cleanup';

export class IntakeMatchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/underwriting-automation/intake-match');
    await this.page.waitForURL(/\/aegis\/underwriting-automation\/intake-match/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/underwriting-automation\/intake-match/,
      headings: ['Intake Matches'],
      buttons: [/New/i],
      columnHeaders: ['Account', 'Purpose', 'Product', 'Carriers', 'Actions']
    });
  }
}

export class UnderwritingSubmissionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-submissions/submissions');
    await this.page.waitForURL(/\/aegis\/form-submissions\/submissions/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-submissions\/submissions/,
      headings: ['Submission Workflows'],
      buttons: [/New/i],
      columnHeaders: ['Account', 'Purpose', 'Resources', 'Packages', 'Actions']
    });
  }

  async openNewSubmissionFlow() {
    await this.page.getByRole('button', { name: /New/i }).first().click();
    await expect(this.page.getByText(/NEW SUBMISSION WORKFLOW/i)).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByPlaceholder(/Search account/i)).toBeVisible();
    await expect(this.page.locator('button.btn-primary', { hasText: /^Save$/i })).toBeVisible();
  }

  async selectAccount(searchTerm: string) {
    const accountSearch = this.page.getByPlaceholder(/Search account/i);
    await accountSearch.click();
    await accountSearch.fill('');
    await accountSearch.fill(searchTerm);

    const menu = this.page.locator('.vs__dropdown-menu').last();
    const option = menu
      .locator('li')
      .filter({ hasNotText: /Sorry, no matching options/i })
      .filter({ hasText: new RegExp(searchTerm, 'i') })
      .first();
    await expect(option).toBeVisible({ timeout: 15000 });

    const exact = menu
      .locator('li')
      .filter({ hasNotText: /Sorry, no matching options/i })
      .filter({ hasText: new RegExp(`^\\s*${searchTerm}\\s*$`, 'i') })
      .first();
    if (await exact.isVisible().catch(() => false)) {
      await exact.click();
    } else {
      await option.click();
    }

    await expect(this.page.locator('.vs__selected').filter({ hasText: new RegExp(searchTerm, 'i') }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async selectFirstResource() {
    const resourceSearch = this.page.getByPlaceholder(/Select resources/i);
    await resourceSearch.click();

    const menu = this.page.locator('.vs__dropdown-menu').last();
    const option = menu.locator('li').filter({ hasNotText: /Sorry, no matching options/i }).first();
    await expect(option).toBeVisible({ timeout: 15000 });
    await option.click();

    await expect(this.page.locator('.vs__selected').nth(1)).toBeVisible({ timeout: 15000 });
  }

  async createSubmissionDraft(options: { purpose: string; accountSearch?: string }) {
    const accountSearch = options.accountSearch ?? 'QA';

    await this.openNewSubmissionFlow();
    await this.selectAccount(accountSearch);
    await this.page.getByPlaceholder(/Describe intent/i).fill(options.purpose);
    await expect(this.page.getByPlaceholder(/Describe intent/i)).toHaveValue(options.purpose);
    await this.selectFirstResource();

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/form-submissions\/submissions\/records\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.locator('button.btn-primary', { hasText: /^Save$/i }).click();
    await saveResponse;

    await expect(this.page.getByText(/Submission workflow saved/i)).toBeVisible({ timeout: 30000 });
    const okButton = this.page.getByRole('button', { name: /^OK$/i });
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click();
    }
  }

  async expectSubmissionInList(purpose: string) {
    await this.goto();
    await this.expectListPage();
    await expect(this.page.getByRole('row').filter({ hasText: purpose }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteSubmission(purpose: string) {
    await this.goto();
    await this.expectListPage();
    await deleteRowByName(this.page, purpose, {
      deleteButton: (row) => row.locator('button.btn-outline-danger, button:has(.fa-trash)').first()
    });
  }
}

export class UnderwritingPackagesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-submissions');
    await this.page.waitForURL(/\/aegis\/form-submissions\/?$/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-submissions\/?$/,
      headings: ['Packages'],
      buttons: [/Add/i],
      columnHeaders: ['Package', 'Carrier / Product', 'Form Mapping', 'Requirements', 'Status', 'Actions']
    });
  }

  async openAddPackageForm() {
    await this.page.getByRole('button', { name: /Add/i }).first().click();
    await expect(this.page.getByPlaceholder(/Package name/i)).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('button', { name: /Save Package/i })).toBeVisible();
  }

  async createPackage(options: { name: string; purpose?: string }) {
    await this.openAddPackageForm();

    const formSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /Select form/i }) })
      .first();
    const optionLabels = await formSelect.locator('option').allTextContents();
    const templateLabel = optionLabels.map((label) => label.trim()).find((label) => label && !/Select form/i.test(label));
    expect(templateLabel, 'expected at least one form template option').toBeTruthy();
    await formSelect.selectOption({ label: templateLabel! });

    const nameInput = this.page.getByPlaceholder(/Package name/i);
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    if (options.purpose) {
      await this.page.getByPlaceholder(/What is this package for/i).fill(options.purpose);
    }

    const firstCarrier = this.page.locator('input.custom-control-input[id^="package-carrier-"]').first();
    if (await firstCarrier.count()) {
      await firstCarrier.check({ force: true });
    }

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/form-submissions\/packages\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.getByRole('button', { name: /Save Package/i }).click();
    await saveResponse;
    await this.expectPackageCreated(options.name);
  }

  async expectPackageCreated(name: string) {
    const successDialog = this.page.getByRole('dialog').filter({ hasText: /Package created successfully/i });
    if (await successDialog.isVisible().catch(() => false)) {
      await successDialog.getByRole('button', { name: /^OK$/i }).click();
    } else {
      await expect(this.page.getByText(/Package created successfully/i)).toBeVisible({ timeout: 15000 });
      const okButton = this.page.getByRole('button', { name: /^OK$/i });
      if (await okButton.isVisible().catch(() => false)) {
        await okButton.click();
      }
    }

    await expect(this.page.getByRole('button', { name: /Save Package/i })).toBeHidden({ timeout: 15000 });
    await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 15000 });
  }

  async deletePackage(name: string) {
    await this.goto();
    await this.expectListPage();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete package"]').first()
    });
  }
}

export class UnderwritingCarriersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/underwriting-automation/settings');
    await this.page.waitForURL(/\/aegis\/underwriting-automation\/settings/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/underwriting-automation\/settings/,
      headings: ['Carrier Settings'],
      buttons: [/Add Carrier Setting/i, /Refresh/i],
      columnHeaders: ['Carrier', 'Type', 'Product Lines', 'Guidelines', 'Actions']
    });
  }
}

export class UnderwritingGuidePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/underwriting-automation/guides');
    await this.page.waitForURL(/\/aegis\/underwriting-automation\/guides/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageShell() {
    await expect(this.page).toHaveURL(/\/aegis\/underwriting-automation\/guides/);
    await expect(this.page.getByRole('button', { name: /Create Guide/i })).toBeVisible();
  }
}

export class UnderwritingOverviewPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/underwriting-automation/about');
    await this.page.waitForURL(/\/aegis\/underwriting-automation\/about/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageShell() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/underwriting-automation\/about/,
      headings: ['How It Works', 'Quick Links', 'Outcome']
    });
  }
}
