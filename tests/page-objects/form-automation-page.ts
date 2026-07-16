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
    await expect(this.page.getByPlaceholder(/Enter template name/i)).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('button', { name: /Save & Edit/i })).toBeVisible();
  }

  async createTemplate(options: { name: string; type?: 'HTML' | 'PDF' }) {
    await this.openAddTemplateEditor();

    const nameInput = this.page.getByPlaceholder(/Enter template name/i);
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    if (options.type) {
      await this.page.locator('select').first().selectOption({ label: options.type });
    }

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/form-fill-template\/templates\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.getByRole('button', { name: /Save & Edit/i }).click();
    await saveResponse;
    await this.expectTemplateEditor(options.name);
  }

  async expectTemplateEditor(name: string) {
    await expect(this.page.getByPlaceholder(/Enter template name/i)).toHaveValue(name);
    await expect(this.page.getByText(/Select a schema to load fields/i)).toBeVisible({ timeout: 15000 });
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
    await expect(this.page.getByRole('heading', { name: /New Form Fill Record/i })).toBeVisible({
      timeout: 15000
    });
    await expect(this.page.getByPlaceholder(/e.g. Renewal Packet/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save/i }).first()).toBeVisible();
  }
}
