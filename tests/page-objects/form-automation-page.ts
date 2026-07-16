import { expect, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';

export class FormFillTemplatesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-fill-template');
    await this.page.waitForURL(/\/aegis\/form-fill-template/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-fill-template/,
      headings: ['Form Fill Templates'],
      buttons: [/Add Template/i],
      columnHeaders: ['Name', 'Type', 'Fields', 'Updated', 'Action']
    });
  }

  async openAddTemplateEditor() {
    await this.page.getByRole('button', { name: /Add Template/i }).click();
    await expect(this.page.getByRole('button', { name: /Save|Create|Add/i }).first()).toBeVisible({ timeout: 15000 });
  }
}

export class FormFillPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-fill');
    await this.page.waitForURL(/\/aegis\/form-fill\/?$/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-fill\/?$/,
      headings: ['Form Fill Records'],
      buttons: [/New/i],
      columnHeaders: ['Account', 'Resources', 'Template', 'Type', 'Actions']
    });
  }

  async openNewFormFill() {
    await this.page.getByRole('button', { name: /New/i }).first().click();
    await expect(
      this.page.getByRole('heading', { name: /Pick an account|New|Form Fill/i }).or(
        this.page.getByRole('textbox', { name: /Search accounts/i })
      ).first()
    ).toBeVisible({ timeout: 15000 });
  }
}
