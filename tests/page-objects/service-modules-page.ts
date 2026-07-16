import { type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';

export class BindingBillingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/binding-billing');
    await this.page.waitForURL(/\/aegis\/binding-billing/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLockedPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/binding-billing/,
      headings: ['Feature Locked', /With Binding and Billing, you can:/i],
      visibleText: [/Locked/i]
    });
  }
}

export class CoiEoiEndorsementsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/coi-eoi-endorsements');
    await this.page.waitForURL(/\/aegis\/coi-eoi-endorsements/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/coi-eoi-endorsements/,
      headings: [/Certificates & Endorsements/i],
      buttons: [/New/i],
      columnHeaders: ['Type', 'Account', 'Policies', 'Issuers', 'Status', 'Unique URL', 'Actions']
    });
  }
}

export class FnolSubmissionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/fnol-submissions');
    await this.page.waitForURL(/\/aegis\/fnol-submissions/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectAdminOnlyPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/fnol-submissions/,
      headings: ['Admin Access Only', /With FNOL Submissions, admins can:/i]
    });
  }
}

export class CrmAmsIntegrationPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/integration');
    await this.page.waitForURL(/\/aegis\/integration/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/integration/,
      headings: ['3rd-Party Providers'],
      buttons: [/Add Provider/i, /Refresh/i],
      columnHeaders: ['Connection', 'Provider', 'Status', 'Objects', 'Last Sync', 'Actions']
    });
  }
}

export class InvoiceCreatorPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/invoice-creator');
    await this.page.waitForURL(/\/invoice-creator/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/invoice-creator/,
      headings: ['Invoices'],
      columnHeaders: ['Name', 'Account', 'Status', 'Resources', 'Created', 'Actions']
    });
  }
}

export class AppSettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/settings');
    await this.page.waitForURL(/\/aegis\/settings\/users/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectUserManagementPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/settings\/users/,
      headings: ['User Management'],
      buttons: [/Add User/i],
      columnHeaders: ['User', 'Email', 'Role', 'Status', 'Actions']
    });
  }
}
