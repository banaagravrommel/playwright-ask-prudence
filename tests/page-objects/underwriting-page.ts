import { expect, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';

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
