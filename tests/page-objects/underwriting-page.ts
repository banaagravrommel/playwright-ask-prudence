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
